import { useEffect, useState } from 'react'
import { ACTIVITY_SERIES, displacement, METALS, type Metal } from '../../chem/redox'
import { Chem, ChemText } from '../../components/Chem'
import { Hl } from '../../components/triplet/Highlight'
import { useHighlight } from '../../components/triplet/highlightContext'
import { ParticleBox, type ParticleKind } from '../../components/triplet/ParticleBox'
import { TripletLayout } from '../../components/triplet/TripletLayout'
import { Button, Callout, Card, CardTitle, Chip } from '../../components/ui'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'
import { seeded } from '../../lib/random'

const DURATION_STEPS = 40
const TICK_MS = 50
const ION_COUNT = 8

/** 金屬片放進金屬離子溶液：預測會不會反應，再從三個表徵觀察 */
export function Activity() {
  const [metal, setMetal] = useState<Metal>(METALS[1])
  const [ionOf, setIonOf] = useState<Metal>(METALS[4])
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [prediction, setPrediction] = useState<boolean | null>(null)
  const { store } = useLearning()

  const d = displacement(metal, ionOf)
  const p = step / DURATION_STEPS
  const done = step >= DURATION_STEPS

  useEffect(() => {
    if (!running || done) return
    const t = setTimeout(() => setStep((s) => s + 1), TICK_MS)
    return () => clearTimeout(t)
  }, [running, step, done])

  const reset = () => {
    setStep(0)
    setRunning(false)
    setPrediction(null)
  }

  const start = (predicted: boolean | null) => {
    if (predicted !== null) {
      setPrediction(predicted)
      store.record('redox.activity', predicted === d.reacts, {
        misconceptionId: predicted && !d.reacts ? 'less-active-displaces' : undefined,
        bkt: { guess: 0.5 },
      })
    }
    setStep(0)
    setRunning(true)
  }

  const shown = running || done ? p : 0

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <CardTitle>金屬片</CardTitle>
            <div className="flex flex-wrap gap-2">
              {METALS.map((m) => (
                <Chip
                  key={m.symbol}
                  active={m.symbol === metal.symbol}
                  onClick={() => {
                    setMetal(m)
                    reset()
                  }}
                >
                  {m.nameZh} <Chem>{m.symbol}</Chem>
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <CardTitle>溶液</CardTitle>
            <div className="flex flex-wrap gap-2">
              {METALS.map((m) => (
                <Chip
                  key={m.symbol}
                  active={m.symbol === ionOf.symbol}
                  onClick={() => {
                    setIonOf(m)
                    reset()
                  }}
                >
                  {m.solution.nameZh} <Chem>{m.solution.formula}</Chem>
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-line pt-4">
          <p className="text-sm font-semibold">
            把{metal.nameZh}片放進{ionOf.solution.nameZh}溶液，你預測會發生反應嗎？
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {running || done ? (
              <Button onClick={reset}>重來</Button>
            ) : (
              <>
                <Button variant="primary" onClick={() => start(true)}>
                  會反應
                </Button>
                <Button variant="primary" onClick={() => start(false)}>
                  不會反應
                </Button>
                <Button variant="ghost" onClick={() => start(null)}>
                  不預測，直接放入
                </Button>
              </>
            )}
          </div>
          {done && prediction !== null && (
            <div className="mt-3">
              {prediction === d.reacts ? (
                <Callout tone="good">預測正確！</Callout>
              ) : (
                <Callout tone="bad">
                  和預測不一樣。
                  {prediction && !d.reacts ? (
                    <span className="mt-1 block">
                      <ChemText>{MISCONCEPTIONS['less-active-displaces'].explanation}</ChemText>
                    </span>
                  ) : (
                    <span className="mt-1 block">{metal.nameZh}的活性比{ionOf.nameZh}大，所以能把{ionOf.nameZh}離子還原成{ionOf.nameZh}。</span>
                  )}
                </Callout>
              )}
            </div>
          )}
        </div>
      </Card>

      <TripletLayout
        macro={<MacroBeaker metal={metal} ionOf={ionOf} p={d.reacts ? shown : 0} reacts={d.reacts} done={done} />}
        micro={<MicroSurface metal={metal} ionOf={ionOf} p={d.reacts ? shown : 0} />}
        symbolic={<Symbolic metal={metal} ionOf={ionOf} revealed={done} />}
      />
    </div>
  )
}

function MacroBeaker({ metal, ionOf, p, reacts, done }: { metal: Metal; ionOf: Metal; p: number; reacts: boolean; done: boolean }) {
  const deposit = ionOf.symbol === 'Ag' ? '#cbd5e1' : ionOf.color
  return (
    <div className="space-y-2">
      <svg viewBox="0 0 140 150" className="mx-auto h-44" role="img" aria-label={`${metal.nameZh}片在${ionOf.solution.nameZh}溶液中`}>
        <rect x={20} y={45} width={100} height={95} fill={ionOf.solution.color} opacity={1 - p} />
        <rect x={20} y={45} width={100} height={95} fill={metal.solution.color} opacity={p} />
        <path d="M18 20 V132 Q18 142 28 142 H112 Q122 142 122 132 V20" fill="none" stroke="var(--glass)" strokeWidth={3} />
        <rect x={60} y={8} width={20} height={118} rx={2} fill={metal.color} stroke="rgba(0,0,0,0.3)" />
        <rect x={60} y={50} width={20} height={76} rx={2} fill={deposit} opacity={p * 0.9} />
        {ionOf.symbol === 'Ag' &&
          p > 0.1 &&
          Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={58 + seeded(i + 11) * 24} cy={55 + seeded(i + 31) * 68} r={1.5 + seeded(i + 51) * 2} fill="#e2e8f0" opacity={p} />
          ))}
      </svg>
      <p className="text-center text-xs text-ink-2">
        {!done
          ? p > 0
            ? '反應中…'
            : `溶液：${ionOf.solution.colorName}`
          : reacts
            ? `${metal.nameZh}片表面析出${ionOf.nameZh}；溶液${ionOf.solution.colorName === metal.solution.colorName ? '顏色不變' : `由${ionOf.solution.colorName}變為${metal.solution.colorName}`}`
            : '沒有明顯變化'}
      </p>
    </div>
  )
}

function MicroSurface({ metal, ionOf, p }: { metal: Metal; ionOf: Metal; p: number }) {
  const d = displacement(metal, ionOf)
  const units = d.reacts ? Math.min(4, Math.floor(ION_COUNT / d.ionCoef)) : 0
  const done = Math.round(p * units)
  const lostAtoms = done * d.metalCoef
  const deposited = done * d.ionCoef
  const { key } = useHighlight()
  const kinds: ParticleKind[] = [
    { key: ionOf.ion, label: short(ionOf.ion), fill: 'var(--series-1)', text: '#fff' },
    { key: metal.ion, label: short(metal.ion), fill: 'var(--series-2)', text: '#fff' },
  ]
  const stripAtoms = 12
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[3.5rem_1fr] gap-2">
        <div className={`rounded-md bg-surface-2 p-1 transition-opacity ${key && key !== metal.symbol && key !== ionOf.symbol ? 'opacity-30' : ''}`}>
          <div className="mb-1 text-center text-[10px] text-ink-2">金屬片表面</div>
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: deposited }, (_, i) => (
              <Atom key={`d${i}`} label={ionOf.symbol} color="var(--series-3)" />
            ))}
            {Array.from({ length: stripAtoms - lostAtoms }, (_, i) => (
              <Atom key={`m${i}`} label={metal.symbol} color="var(--series-4)" />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] text-ink-2">溶液中的離子</div>
          <ParticleBox kinds={kinds} counts={[ION_COUNT - deposited, lostAtoms]} label={`溶液中 ${ionOf.ion} ${ION_COUNT - deposited} 個、${metal.ion} ${lostAtoms} 個`} />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 text-xs">
        <Hl k={metal.symbol}>
          <span className="mr-1 inline-block size-2.5 rounded-full align-middle" style={{ background: 'var(--series-4)' }} />
          {metal.nameZh}原子
        </Hl>
        <Hl k={ionOf.symbol}>
          <span className="mr-1 inline-block size-2.5 rounded-full align-middle" style={{ background: 'var(--series-3)' }} />
          析出的{ionOf.nameZh}原子
        </Hl>
        <Hl k={ionOf.ion}>
          <Chem>{ionOf.ion}</Chem>
        </Hl>
        <Hl k={metal.ion}>
          <Chem>{metal.ion}</Chem>
        </Hl>
      </div>
      <p className="text-xs text-ink-2">
        {d.reacts ? `已轉移 ${done * d.electrons} 個電子：${metal.nameZh}原子把電子交給${ionOf.nameZh}離子。` : '沒有電子轉移，粒子不變。'}
      </p>
    </div>
  )
}

function Atom({ label, color }: { label: string; color: string }) {
  return (
    <span className="flex size-5 items-center justify-center rounded-full text-[8px] font-semibold text-white" style={{ background: color }}>
      {label}
    </span>
  )
}

const short = (ion: string) => ion.replace('^2+', '²⁺').replace('^+', '⁺')

function Symbolic({ metal, ionOf, revealed }: { metal: Metal; ionOf: Metal; revealed: boolean }) {
  const d = displacement(metal, ionOf)
  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="mb-1 text-xs text-ink-2">金屬活性（左邊較活潑，容易失去電子）</div>
        <div className="flex flex-wrap gap-1">
          {ACTIVITY_SERIES.map((m) => {
            const role = m.symbol === metal.symbol ? '金屬片' : m.symbol === ionOf.symbol ? '溶液' : null
            return (
              <span
                key={m.symbol}
                className={`rounded border px-1.5 py-0.5 text-xs ${role ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-line text-ink-2'}`}
              >
                {m.symbol}
                {role && <span className="ml-0.5 text-[10px]">（{role}）</span>}
              </span>
            )
          })}
        </div>
      </div>
      {!revealed ? (
        <p className="text-xs text-ink-2">放入金屬片後，這裡會顯示反應式。</p>
      ) : d.reacts ? (
        <div className="space-y-1.5">
          <div className="rounded-lg bg-surface-2 px-2 py-2 text-center">
            <Chem>{d.netIonic!}</Chem>
          </div>
          <div className="text-xs">
            <span className="text-bad">氧化（失去電子）</span>：<Chem>{d.oxidationHalf!}</Chem>
          </div>
          <div className="text-xs">
            <span className="text-accent">還原（得到電子）</span>：<Chem>{d.reductionHalf!}</Chem>
          </div>
        </div>
      ) : (
        <p>
          {metal.symbol === ionOf.symbol ? '同一種金屬，不會發生置換。' : `${metal.nameZh}的活性比${ionOf.nameZh}小，無法把${ionOf.nameZh}離子還原，所以不反應。`}
        </p>
      )}
    </div>
  )
}
