import { useState } from 'react'
import {
  hasConfigurationException,
  orbitalBoxes,
  ORBITALS,
  PERIODIC_TABLE,
  ruleConfiguration,
  ruleFilling,
  SHELL_NAMES,
  type PeriodicElement,
} from '../../chem/periodicTable'
import { ChemText } from '../../components/Chem'
import { Button, Callout, Card, CardTitle, Chip, Segmented } from '../../components/ui'
import type { Level } from '../../learning/concepts'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'
import { BohrModel } from './BohrModel'

const MAX_Z = 36
const QUICK = ['H', 'C', 'N', 'O', 'Na', 'K', 'Ca', 'Cr', 'Fe', 'Cu', 'Zn', 'Br', 'Kr']

/** 電子排列：國中的波耳模型 ↔ 高中的軌域方格圖 */
export function Orbitals({ params }: { params: URLSearchParams }) {
  const zParam = Number(params.get('z'))
  const [z, setZ] = useState(zParam >= 1 && zParam <= MAX_Z ? zParam : 8)
  const [level, setLevel] = useState<Level>(params.get('level') === 'senior' ? 'senior' : 'junior')
  const el = PERIODIC_TABLE[z - 1]

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>選擇元素（1–36 號）</CardTitle>
          <Segmented<Level>
            value={level}
            onChange={setLevel}
            options={[
              { value: 'junior', label: '國中（波耳模型）' },
              { value: 'senior', label: '高中（軌域）' },
            ]}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setZ((v) => Math.max(1, v - 1))} disabled={z <= 1}>
            ←
          </Button>
          <input type="range" min={1} max={MAX_Z} value={z} onChange={(e) => setZ(+e.target.value)} aria-label="原子序" className="flex-1" />
          <Button onClick={() => setZ((v) => Math.min(MAX_Z, v + 1))} disabled={z >= MAX_Z}>
            →
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((s) => {
            const e = PERIODIC_TABLE.find((x) => x.symbol === s)!
            return (
              <Chip key={s} active={e.z === z} onClick={() => setZ(e.z)}>
                {e.symbol}
              </Chip>
            )
          })}
        </div>
        <div className="text-lg font-bold">
          {el.z}. {el.nameZh} {el.symbol}
        </div>
      </Card>

      {level === 'junior' ? <JuniorView el={el} /> : <SeniorView el={el} />}
    </div>
  )
}

function JuniorView({ el }: { el: PeriodicElement }) {
  return (
    <Card>
      <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
        <BohrModel element={el} />
        <div className="space-y-3 text-sm">
          <div className="text-base">
            電子排列：<strong className="font-mono">{el.shells.join(', ')}</strong>
          </div>
          <ul className="space-y-1">
            {el.shells.map((n, i) => (
              <li key={i}>
                第 {i + 1} 層（{SHELL_NAMES[i]} 層）：{n} 個電子
              </li>
            ))}
          </ul>
          {el.z > 20 && <Callout tone="info">超過 20 號的元素，電子排列不再是 2、8、8 的規律，高中會用「軌域」來說明。</Callout>}
          <div className="rounded-lg border border-line bg-surface-2 p-3">
            <div className="font-semibold">這是「波耳模型」，是一種簡化的模型</div>
            <p className="mt-1 text-ink-2">
              它把電子畫在一圈一圈的同心圓上，能幫助我們理解電子「分層」排列、最外層電子決定化學性質。但電子其實沒有固定的圓形軌道——高中會學到更精確的「軌域」。
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function SeniorView({ el }: { el: PeriodicElement }) {
  const boxes = orbitalBoxes(el.z)
  const exception = hasConfigurationException(el.z)
  return (
    <>
      <Card>
        <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
          <div>
            <BohrModel element={el} />
            <p className="text-center text-xs text-ink-2">國中的波耳模型：{el.shells.join(', ')}</p>
            <p className="mt-2 text-xs text-ink-2">波耳模型的第 n 層，對應軌域的主量子數 n（例如第 3 層 = 3s、3p、3d）。</p>
          </div>
          <div className="space-y-3">
            <CardTitle>軌域方格圖（越上面能量越高）</CardTitle>
            <div className="space-y-1.5">
              {[...boxes].reverse().map((b) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="w-8 text-right font-mono text-sm font-semibold">{b.name}</span>
                  <div className="flex gap-1">
                    {b.orbitals.map(([up, down], i) => (
                      <span
                        key={i}
                        className={`flex h-8 w-8 items-center justify-center rounded border font-mono text-base leading-none ${up ? 'border-accent' : 'border-line'}`}
                        aria-label={`${b.name} 第 ${i + 1} 個軌域：${up && down ? '成對' : up ? '一個電子' : '空'}`}
                      >
                        {up && <span className="text-accent">↑</span>}
                        {down && <span className="text-accent">↓</span>}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-ink-2">{b.electrons} 個</span>
                </div>
              ))}
            </div>
            <div className="text-sm">
              電子組態：<Config text={el.configuration} />
            </div>
            {exception && (
              <Callout tone="warn">
                例外！依填入順序規則應該是 <Config text={ruleConfiguration(el.z)} />，實際上是 <Config text={el.configuration} />
                {el.symbol === 'Cr' || el.symbol === 'Cu' ? '：半填滿（d⁵）或全填滿（d¹⁰）的 d 軌域特別穩定。' : '。'}
              </Callout>
            )}
            <ul className="list-disc space-y-0.5 pl-5 text-xs text-ink-2">
              <li>構築原理：電子依能量由低到高填入：1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p…</li>
              <li>包立不相容原理：每個軌域最多 2 個電子，自旋相反（↑↓）。</li>
              <li>洪德定則：同一副殼層中，電子先分別填入不同軌域、自旋相同，再開始成對。</li>
            </ul>
          </div>
        </div>
      </Card>
      {el.z < MAX_Z && <NextElectron el={el} />}
    </>
  )
}

/** 想一想：下一個元素多出的電子會填到哪裡？ */
function NextElectron({ el }: { el: PeriodicElement }) {
  const { store } = useLearning()
  const [picked, setPicked] = useState<{ z: number; choice: string } | null>(null)
  const next = el.z + 1
  // 例外元素（或前後有例外）不出題，避免規則與實際不一致
  if (hasConfigurationException(el.z) || hasConfigurationException(next)) return null
  const a = ruleFilling(el.z)
  const b = ruleFilling(next)
  const answer = ORBITALS.find((o) => (b[o] ?? 0) > (a[o] ?? 0))!
  const idx = ORBITALS.indexOf(answer)
  const options = [...new Set([ORBITALS[idx - 1], answer, ORBITALS[idx + 1], answer === '4s' ? '3d' : undefined].filter((o): o is string => !!o))].sort(
    (x, y) => ORBITALS.indexOf(x) - ORBITALS.indexOf(y),
  )
  const mine = picked?.z === el.z ? picked.choice : null

  const choose = (o: string) => {
    if (mine) return
    setPicked({ z: el.z, choice: o })
    const misconceptionId = o !== answer && answer === '4s' && o === '3d' ? 'fill-by-shell-order' : undefined
    store.record('pt.orbitals', o === answer, { misconceptionId, bkt: { guess: 1 / options.length } })
  }

  return (
    <Card className="space-y-2">
      <CardTitle>想一想</CardTitle>
      <p className="text-sm">
        下一個元素（{next} 號 {PERIODIC_TABLE[next - 1].nameZh}）多出來的那個電子，會填入哪一個副殼層？
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={mine === o} onClick={() => choose(o)}>
            <span className="font-mono">{o}</span>
          </Chip>
        ))}
      </div>
      {mine && (
        <Callout tone={mine === answer ? 'good' : 'bad'}>
          {mine === answer ? '答對了！' : `答案是 ${answer}。`}按右上角的 → 看看下一個元素的方格圖。
          {mine !== answer && answer === '4s' && mine === '3d' && (
            <span className="mt-1 block">
              <ChemText>{MISCONCEPTIONS['fill-by-shell-order'].explanation}</ChemText>
            </span>
          )}
        </Callout>
      )}
    </Card>
  )
}

function Config({ text }: { text: string }) {
  return (
    <span className="font-mono">
      {text.split(' ').map((part, i) => {
        const m = /^(\d[spdf])(\d+)$/.exec(part)
        return (
          <span key={i}>
            {i > 0 && ' '}
            {m ? (
              <>
                {m[1]}
                <sup>{m[2]}</sup>
              </>
            ) : (
              part
            )}
          </span>
        )
      })}
    </span>
  )
}
