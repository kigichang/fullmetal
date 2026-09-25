import { useEffect, useMemo, useState } from 'react'
import { simulateDynamic } from '../../chem/equilibrium'
import { Chem, ChemText } from '../../components/Chem'
import { TimeChart } from '../../components/TimeChart'
import { Hl } from '../../components/triplet/Highlight'
import { ParticleBox, type ParticleKind } from '../../components/triplet/ParticleBox'
import { TripletLayout } from '../../components/triplet/TripletLayout'
import { Button, Callout, Card, CardTitle, Chip } from '../../components/ui'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'

const N = 40
const STEPS = 200
const TICK_MS = 70
const WINDOW = 15

const KINDS: ParticleKind[] = [
  { key: 'A', label: 'A', fill: 'var(--series-1)', text: '#fff' },
  { key: 'B', label: 'B', fill: 'var(--series-2)', text: '#fff' },
]

type Start = 'A' | 'B' | 'half'
const START_A: Record<Start, number> = { A: N, B: 0, half: N / 2 }

/** A ⇌ B 的粒子模擬：看濃度穩定後，正、逆反應仍在進行 */
export function DynamicEquilibrium() {
  const [pf, setPf] = useState(0.1)
  const [pr, setPr] = useState(0.05)
  const [start, setStart] = useState<Start>('A')
  const [seed, setSeed] = useState(1)
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [answer, setAnswer] = useState<'stopped' | 'going' | null>(null)
  const { store } = useLearning()

  const sim = useMemo(() => simulateDynamic(N, START_A[start], pf, pr, STEPS, seed), [start, pf, pr, seed])
  const visible = sim.slice(0, frame + 1)
  const cur = visible.at(-1)!
  const recent = visible.slice(-WINDOW)
  const avg = (f: (s: (typeof sim)[number]) => number) => recent.reduce((s, x) => s + f(x), 0) / Math.max(1, recent.length)
  const fwdRate = avg((s) => s.forward)
  const revRate = avg((s) => s.reverse)
  // 「看起來不再改變」：最近兩段時間的平均 A 數量相差很小
  const settled =
    frame > 60 &&
    Math.abs(sim.slice(frame - 20, frame).reduce((s, x) => s + x.a, 0) / 20 - sim.slice(frame - 40, frame - 20).reduce((s, x) => s + x.a, 0) / 20) < 1.5
  const done = frame >= STEPS

  useEffect(() => {
    if (!playing || done) return
    const t = setTimeout(() => setFrame((f) => f + 1), TICK_MS)
    return () => clearTimeout(t)
  }, [playing, frame, done])

  const restart = (patch: () => void) => {
    patch()
    setFrame(0)
    setPlaying(false)
    setAnswer(null)
  }

  const respond = (a: 'stopped' | 'going') => {
    setAnswer(a)
    store.record('eq.dynamic', a === 'going', {
      misconceptionId: a === 'stopped' ? 'equilibrium-static' : undefined,
      bkt: { guess: 0.5 },
    })
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <CardTitle>設定可逆反應 A ⇌ B</CardTitle>
        <div className="grid gap-4 md:grid-cols-3">
          <Slider label="正反應（A → B）每一步發生的機率" value={pf} onChange={(v) => restart(() => setPf(v))} />
          <Slider label="逆反應（B → A）每一步發生的機率" value={pr} onChange={(v) => restart(() => setPr(v))} />
          <div className="text-sm">
            <div className="mb-1.5">一開始放入</div>
            <div className="flex flex-wrap gap-2">
              {(['A', 'B', 'half'] as Start[]).map((s) => (
                <Chip key={s} active={start === s} onClick={() => restart(() => setStart(s))}>
                  {s === 'half' ? '各一半' : `全部是 ${s}`}
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => (done ? restart(() => setSeed((x) => x + 1)) : setPlaying((p) => !p))}>
            {done ? '重新開始' : playing ? '暫停' : frame === 0 ? '開始' : '繼續'}
          </Button>
          <Button variant="ghost" onClick={() => restart(() => setSeed((x) => x + 1))}>
            重來
          </Button>
          <span className="self-center text-xs text-ink-2">
            第 {frame} / {STEPS} 步
          </span>
        </div>
      </Card>

      <TripletLayout
        macro={
          <div className="space-y-2 text-center">
            <svg viewBox="0 0 120 120" className="mx-auto h-36" role="img" aria-label={`容器中紅棕色的深淺：B 占 ${Math.round((cur.b / N) * 100)}%`}>
              <rect x={20} y={10} width={80} height={100} rx={10} fill="var(--surface-2)" stroke="var(--glass)" strokeWidth={3} />
              <rect x={23} y={13} width={74} height={94} rx={8} fill="#9a3412" opacity={(cur.b / N) * 0.85} />
            </svg>
            <p className="text-sm">
              假設 <Hl k="A">A 無色</Hl>、<Hl k="B">B 紅棕色</Hl>
            </p>
            <p className="text-xs text-ink-2">{frame === 0 ? '按「開始」觀察顏色變化' : settled ? '顏色看起來不再改變了' : '顏色正在改變…'}</p>
          </div>
        }
        micro={
          <div className="space-y-2">
            <ParticleBox kinds={KINDS} counts={[cur.a, cur.b]} label={`A ${cur.a} 個、B ${cur.b} 個`} />
            <div className="flex gap-4 text-xs">
              <Hl k="A">A × {cur.a}</Hl>
              <Hl k="B">B × {cur.b}</Hl>
            </div>
            <p className="text-xs text-ink-2">
              這一步有 {cur.forward} 個 A 變成 B、{cur.reverse} 個 B 變回 A。
            </p>
          </div>
        }
        symbolic={
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-surface-2 py-2 text-center text-base">
              <Hl k="A">A</Hl> <Chem>{'<=>'}</Chem> <Hl k="B">B</Hl>
            </div>
            <RateBar label="正反應速率（A → B）" value={fwdRate} color="var(--series-1)" />
            <RateBar label="逆反應速率（B → A）" value={revRate} color="var(--series-2)" />
            <p className="text-xs text-ink-2">速率＝最近 {WINDOW} 步平均每步反應的粒子數</p>
            {settled && (
              <p className="text-xs">
                平衡時 B : A 約為 {(cur.b / Math.max(1, cur.a)).toFixed(2)}，理論值是正、逆反應機率的比 {(pf / pr).toFixed(2)}。
              </p>
            )}
          </div>
        }
      />

      {settled && (
        <Card className="space-y-3">
          <CardTitle>想一想</CardTitle>
          <p className="text-sm">A 和 B 的數量已經差不多不再改變。這時候，反應停止了嗎？</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={answer === 'stopped'} onClick={() => answer === null && respond('stopped')}>
              停止了
            </Chip>
            <Chip active={answer === 'going'} onClick={() => answer === null && respond('going')}>
              還在進行
            </Chip>
          </div>
          {answer === 'going' && (
            <Callout tone="good">
              沒錯！看粒子圖和速率：每一步仍有 A 變 B、B 變 A，只是兩個方向的速率相等，所以數量不再改變。這就是<strong>動態平衡</strong>。
            </Callout>
          )}
          {answer === 'stopped' && (
            <Callout tone="bad">
              <ChemText>{MISCONCEPTIONS['equilibrium-static'].explanation}</ChemText>
              <span className="mt-1 block">看看右邊的速率：兩個都不是 0。</span>
            </Callout>
          )}
        </Card>
      )}

      <Card>
        <TimeChart
          series={[
            { key: 'A', label: 'A', color: 'var(--series-1)', values: visible.map((s) => s.a) },
            { key: 'B', label: 'B', color: 'var(--series-2)', values: visible.map((s) => s.b) },
          ]}
          yLabel="粒子數"
          xLabel="步數"
          format={(v) => String(Math.round(v))}
          caption="A、B 粒子數隨時間的變化：一段時間後兩條線不再有明顯的升降，但反應並沒有停止。"
        />
      </Card>
    </div>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between gap-2">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(2)}</span>
      </span>
      <input type="range" min={0.02} max={0.2} step={0.01} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  )
}

function RateBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{value.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-surface-2">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${Math.min(100, (value / 8) * 100)}%`, background: color }} />
      </div>
    </div>
  )
}
