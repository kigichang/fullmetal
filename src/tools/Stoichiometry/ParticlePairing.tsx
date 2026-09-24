import { useEffect, useState } from 'react'
import { equationChem, TWO_REACTANT_REACTIONS, type Reaction } from '../../chem/equations'
import { molarMass } from '../../chem/formula'
import { fmt, pairSteps } from '../../chem/stoichiometry'
import { Chem, ChemText } from '../../components/Chem'
import { Molecule } from '../../components/Molecule'
import { Hl } from '../../components/triplet/Highlight'
import { useHighlight } from '../../components/triplet/highlightContext'
import { TripletLayout } from '../../components/triplet/TripletLayout'
import { Button, Callout, Card, CardTitle, Chip } from '../../components/ui'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'

const MAX = 12
const STEP_MS = 700
const NONE = 'none'

/**
 * 分子個數必須是係數的倍數，限量試劑才會剛好用完（否則兩種都可能剩下零頭）。
 * 預設值刻意讓「個數比較多的反而先用完」，對應常見迷思。
 */
const DEFAULT_COUNTS: Record<string, [number, number]> = {
  water: [4, 3],
  carbon: [3, 2],
  magnesium: [4, 3],
  zinc: [2, 6],
  methane: [2, 6],
  ammonia: [2, 3],
  marble: [2, 2],
  rust: [4, 6],
  propane: [2, 5],
  aluminium: [4, 6],
}

const defaultsFor = (r: Reaction): [number, number] => DEFAULT_COUNTS[r.id] ?? [r.coefficients[0] * 2, r.coefficients[1] * 2]
const maxFor = (coef: number) => Math.floor(MAX / coef) * coef

type Phase = 'setup' | 'playing' | 'done'

/** 粒子配對：用分子個數預測、觀察限量試劑，三表徵同步呈現 */
export function ParticlePairing() {
  const [reaction, setReaction] = useState<Reaction>(TWO_REACTANT_REACTIONS[0])
  const [counts, setCounts] = useState<[number, number]>(() => defaultsFor(TWO_REACTANT_REACTIONS[0]))
  const [running, setRunning] = useState(false)
  const [frame, setFrame] = useState(0)
  const [guess, setGuess] = useState<string | null>(null)
  const [guessLeft, setGuessLeft] = useState(1)
  const { store } = useLearning()

  const states = pairSteps(reaction, counts)
  const phase: Phase = !running ? 'setup' : frame >= states.length - 1 ? 'done' : 'playing'
  const final = states.at(-1)!.counts
  const current = states[Math.min(frame, states.length - 1)].counts
  const species = [...reaction.reactants, ...reaction.products]
  const leftoverIdx = final.slice(0, 2).findIndex((n) => n > 0)
  const answerKey = leftoverIdx === -1 ? NONE : reaction.reactants[leftoverIdx]
  const answerLeft = leftoverIdx === -1 ? 0 : final[leftoverIdx]

  const reset = (r: Reaction, c: [number, number]) => {
    setReaction(r)
    setCounts(c)
    setRunning(false)
    setFrame(0)
    setGuess(null)
    setGuessLeft(1)
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const t = setTimeout(() => setFrame((f) => f + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [phase, frame])

  const predictionCorrect = guess !== null && guess === answerKey && (guess === NONE || guessLeft === answerLeft)

  /** 預測錯誤時推測迷思 */
  const predictionMisconception = (): string | undefined => {
    if (guess === null || predictionCorrect || guess === answerKey) return undefined
    if (guess === NONE) return 'all-consumed'
    // 預測個數多的會剩下 → 以為個數少的先用完（沒有除以係數）
    const larger = counts[0] > counts[1] ? 0 : counts[1] > counts[0] ? 1 : -1
    return larger !== -1 && guess === reaction.reactants[larger] ? 'limiting-no-ratio' : undefined
  }

  const start = (withPrediction: boolean) => {
    if (withPrediction && guess) {
      store.record('mole.limiting', predictionCorrect, { misconceptionId: predictionMisconception(), bkt: { guess: 1 / 3 } })
    }
    setFrame(0)
    setRunning(true)
  }

  const wrongMis = phase === 'done' ? predictionMisconception() : undefined

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <CardTitle>① 選反應、放入分子</CardTitle>
          <div className="flex flex-wrap gap-2">
            {TWO_REACTANT_REACTIONS.filter((r) => r.id !== 'respiration').map((r) => (
              <Chip key={r.id} active={r.id === reaction.id} onClick={() => reset(r, defaultsFor(r))}>
                {r.nameZh}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          {reaction.reactants.map((f, i) => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <Chem className="w-16 font-semibold">{f}</Chem>
              <Stepper
                value={counts[i]}
                onChange={(v) => reset(reaction, (i === 0 ? [v, counts[1]] : [counts[0], v]) as [number, number])}
                label={`${f} 分子個數`}
                step={reaction.coefficients[i]}
                min={reaction.coefficients[i]}
                max={maxFor(reaction.coefficients[i])}
              />
              <span className="text-ink-2">個{reaction.coefficients[i] > 1 && `（每次 ${reaction.coefficients[i]} 個）`}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-line pt-4">
          <CardTitle>② 先預測：反應到不能再反應時，會剩下什麼？</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {[...reaction.reactants, NONE].map((k) => (
              <Chip key={k} active={guess === k} onClick={() => phase === 'setup' && setGuess(k)}>
                {k === NONE ? '都不剩' : <>剩下 <Chem>{k}</Chem></>}
              </Chip>
            ))}
            {guess && guess !== NONE && (
              <span className="flex items-center gap-2 text-sm">
                剩
                <Stepper value={guessLeft} onChange={setGuessLeft} label="預測剩下的個數" min={1} disabled={phase !== 'setup'} />
                個
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {phase === 'setup' ? (
              <>
                <Button variant="primary" onClick={() => start(true)} disabled={!guess}>
                  開始反應
                </Button>
                <Button variant="ghost" onClick={() => start(false)}>
                  不預測，直接看
                </Button>
              </>
            ) : (
              <Button onClick={() => reset(reaction, counts)}>重來</Button>
            )}
          </div>
          {phase === 'done' && guess && (
            <div className="mt-3">
              {predictionCorrect ? (
                <Callout tone="good">預測正確！</Callout>
              ) : (
                <Callout tone="bad">
                  和預測不一樣：實際上{answerKey === NONE ? '兩者剛好都用完' : <>剩下 {answerLeft} 個 <Chem>{answerKey}</Chem></>}。
                  {wrongMis && (
                    <span className="mt-1 block">
                      <ChemText>{MISCONCEPTIONS[wrongMis].explanation}</ChemText>
                    </span>
                  )}
                </Callout>
              )}
            </div>
          )}
        </div>
      </Card>

      <TripletLayout
        macro={<MacroPane species={species} current={current} />}
        micro={<MicroPane species={species} current={current} phase={phase} frame={frame} />}
        symbolic={<SymbolicPane reaction={reaction} initial={states[0].counts} current={current} />}
      />
    </div>
  )
}

function Stepper({
  value,
  onChange,
  label,
  min = 1,
  max = MAX,
  step = 1,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  label: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}) {
  const btn = 'size-8 rounded-lg border border-line bg-surface-2 text-lg leading-none hover:border-accent disabled:opacity-30'
  return (
    <span className="inline-flex items-center gap-1">
      <button type="button" className={btn} aria-label={`減少${label}`} disabled={disabled || value - step < min} onClick={() => onChange(value - step)}>
        −
      </button>
      <span className="w-6 text-center font-mono tabular-nums">{value}</span>
      <button type="button" className={btn} aria-label={`增加${label}`} disabled={disabled || value + step > max} onClick={() => onChange(value + step)}>
        +
      </button>
    </span>
  )
}

/** 巨觀：把每顆分子想成 1 莫耳，換算成質量；總質量反應前後不變 */
function MacroPane({ species, current }: { species: string[]; current: number[] }) {
  const masses = species.map((f, i) => current[i] * molarMass(f))
  const total = masses.reduce((a, b) => a + b, 0)
  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-ink-2">假設每顆分子代表 1 莫耳（6×10²³ 個），在天平上秤得的質量：</p>
      <ul className="space-y-1.5">
        {species.map((f, i) => (
          <li key={f} className="flex items-center gap-2">
            <Hl k={f} className="w-20 shrink-0">
              <Chem>{f}</Chem>
            </Hl>
            <div className="h-3 flex-1 rounded-full bg-surface-2">
              <div className="h-3 rounded-full bg-accent transition-all duration-500" style={{ width: `${total ? (masses[i] / total) * 100 : 0}%` }} />
            </div>
            <span className="w-14 text-right font-mono tabular-nums">{fmt(masses[i], 1)} g</span>
          </li>
        ))}
      </ul>
      <div className="rounded-lg bg-surface-2 px-3 py-2">
        容器總質量 <strong className="font-mono">{fmt(total, 1)} g</strong>
        <span className="block text-xs text-ink-2">反應前後都一樣：質量守恆</span>
      </div>
    </div>
  )
}

/** 微觀：每種分子一列，數量隨反應逐步改變 */
function MicroPane({ species, current, phase, frame }: { species: string[]; current: number[]; phase: Phase; frame: number }) {
  const { key } = useHighlight()
  return (
    <div className="space-y-3">
      <div className="text-xs text-ink-2">
        {phase === 'setup' ? '反應前' : phase === 'playing' ? `反應中…已反應 ${frame} 份` : `反應結束（共反應 ${frame} 份）`}
      </div>
      {species.map((f, i) => (
        <div key={f} className={`transition-opacity ${key && key !== f ? 'opacity-25' : ''}`}>
          <Hl k={f} className="text-xs font-semibold">
            <Chem>{f}</Chem> × {current[i]}
          </Hl>
          <div className="mt-1 flex min-h-7 flex-wrap items-center gap-1">
            {Array.from({ length: current[i] }, (_, k) => (
              <Molecule key={k} formula={f} scale={f.length > 4 ? 0.5 : 0.7} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** 符號：反應式與「反應前／變化量／目前」表 */
function SymbolicPane({ reaction, initial, current }: { reaction: Reaction; initial: number[]; current: number[] }) {
  const species = [...reaction.reactants, ...reaction.products]
  const nR = reaction.reactants.length
  const rows: [string, (i: number) => string][] = [
    ['反應前', (i) => String(initial[i])],
    ['變化', (i) => {
      const d = current[i] - initial[i]
      return d > 0 ? `+${d}` : String(d)
    }],
    ['目前', (i) => String(current[i])],
  ]
  return (
    <div className="space-y-3 text-sm">
      <div className="overflow-x-auto rounded-lg bg-surface-2 px-2 py-2 text-center text-base">
        {species.map((f, i) => (
          <span key={f}>
            {i > 0 && <span className="mx-1 text-ink-2">{i === nR ? '→' : '+'}</span>}
            <Hl k={f}>
              <Chem>{`${reaction.coefficients[i] === 1 ? '' : reaction.coefficients[i]}${f}`}</Chem>
            </Hl>
          </span>
        ))}
      </div>
      <p className="text-xs text-ink-2">
        係數比 {reaction.coefficients.join(' : ')} 就是「每一份反應」用掉與生成的分子個數。
        <span className="sr-only">
          <Chem>{equationChem(reaction)}</Chem>
        </span>
      </p>
      <table className="w-full text-right">
        <thead>
          <tr className="border-b border-line">
            <th className="py-1 text-left font-medium text-ink-2">（個）</th>
            {species.map((f) => (
              <th key={f} className="px-1 py-1 font-semibold">
                <Hl k={f}>
                  <Chem>{f}</Chem>
                </Hl>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, cell]) => (
            <tr key={label} className="border-b border-line last:border-0">
              <td className="py-1 text-left text-ink-2">{label}</td>
              {species.map((f, i) => (
                <td key={f} className="px-1 py-1 font-mono tabular-nums">
                  {cell(i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
