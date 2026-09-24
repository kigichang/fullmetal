import { useState, type ReactNode } from 'react'
import type { Reaction } from '../../chem/equations'
import { molarMass } from '../../chem/formula'
import { AVOGADRO_COEF, fmt, isClose, type AmountUnit, type LimitingResult } from '../../chem/stoichiometry'
import { Chem, ChemText } from '../../components/Chem'
import { Button, Callout, Card, CardTitle } from '../../components/ui'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'

/** 每一步對應的觀念 */
const STEP_CONCEPTS = ['mole.conversion', 'mole.ratio', 'mole.limiting', 'mole.ratio']

interface Field {
  id: string
  label: ReactNode
  expected: number
  suffix: string
}

interface Props {
  reaction: Reaction
  inputs: { amount: string; unit: AmountUnit }[]
  moles: [number, number]
  result: LimitingResult
  onDone: () => void
}

const EXACT = 'both'

export function GuidedSteps({ reaction, inputs, moles, result, onDone }: Props) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [choice, setChoice] = useState<string | null>(null)
  const [recorded, setRecorded] = useState<Set<number>>(() => new Set())
  const { store } = useLearning()

  const [A, B] = reaction.reactants
  const coefs = reaction.coefficients
  const limitingKey = result.limitingIndex === null ? EXACT : reaction.reactants[result.limitingIndex]
  const excessIndex = result.limitingIndex === null ? null : 1 - result.limitingIndex

  const molHint = (i: number) => {
    const f = reaction.reactants[i]
    const { amount, unit } = inputs[i]
    if (unit === 'g') return `${amount} ÷ ${molarMass(f)}`
    if (unit === 'particles') return `${amount}×10²³ ÷ ${AVOGADRO_COEF}×10²³`
    return '已經是莫耳數'
  }

  const steps: { title: string; hint: ReactNode; fields: Field[] }[] = [
    {
      title: '① 把反應物換算成莫耳數',
      hint: (
        <>
          莫耳數 = 質量 ÷ 分子量；粒子數 ÷ 6×10²³。
          <br />
          <Chem>{A}</Chem>：{molHint(0)}　<Chem>{B}</Chem>：{molHint(1)}
        </>
      ),
      fields: reaction.reactants.map((f, i) => ({ id: `mol-${i}`, label: <Chem>{f}</Chem>, expected: moles[i], suffix: 'mol' })),
    },
    {
      title: '② 各自除以反應式的係數',
      hint: (
        <>
          係數代表「一份反應」需要的莫耳數。算算看各有幾份：<Chem>{A}</Chem> ÷ {coefs[0]}、<Chem>{B}</Chem> ÷ {coefs[1]}。
        </>
      ),
      fields: reaction.reactants.map((f, i) => ({
        id: `ratio-${i}`,
        label: (
          <>
            <Chem>{f}</Chem> ÷ {coefs[i]}
          </>
        ),
        expected: result.ratios[i],
        suffix: '份',
      })),
    },
    {
      title: '③ 誰會先用完？',
      hint: '份數比較少的那一個會先用完，它就是限量試劑。',
      fields: [],
    },
    {
      title: '④ 算出產物與剩下的量',
      hint: (
        <>
          反應了 {fmt(result.extent)} 份。產物莫耳數 = 份數 × 係數；過量試劑剩下 = 原本 − 份數 × 係數。
        </>
      ),
      fields: [
        ...result.rows
          .filter((r) => r.role === 'product')
          .map((r) => ({ id: `prod-${r.formula}`, label: <>生成 <Chem>{r.formula}</Chem></>, expected: r.final, suffix: 'mol' })),
        ...(excessIndex === null
          ? []
          : [
              {
                id: 'excess',
                label: (
                  <>
                    剩下 <Chem>{reaction.reactants[excessIndex]}</Chem>
                  </>
                ),
                expected: result.rows[excessIndex].final,
                suffix: 'mol',
              },
            ]),
      ],
    },
  ]

  const current = steps[step]
  const done = step >= steps.length
  const fieldOk = (f: Field) => isClose(parseFloat(values[f.id] ?? ''), f.expected)
  const stepOk = step === 2 ? choice === limitingKey : current?.fields.every(fieldOk)

  const advance = () => {
    const next = step + 1
    setStep(next)
    setChecked(false)
    if (next >= steps.length) onDone()
  }
  /** 第 ③ 步選錯時，推測學生用了哪一種錯誤的比較方法 */
  const limitingMisconception = (): string | undefined => {
    if (step !== 2 || choice === null || choice === limitingKey) return undefined
    if (choice === EXACT) return 'all-consumed'
    const masses = moles.map((n, i) => n * molarMass(reaction.reactants[i]))
    const smaller = (xs: number[]) => (xs[0] < xs[1] ? 0 : 1)
    const pickedIdx = reaction.reactants.indexOf(choice)
    const byGrams = inputs.every((x) => x.unit === 'g')
    if (byGrams && pickedIdx === smaller(masses)) return 'limiting-smaller-mass'
    if (pickedIdx === smaller(moles)) return 'limiting-no-ratio'
    return undefined
  }
  const misconception = checked && !stepOk ? limitingMisconception() : undefined

  // 每一步只記錄第一次的結果，避免反覆嘗試灌高或拉低精熟度
  const recordOnce = (correct: boolean, misconceptionId?: string) => {
    if (recorded.has(step)) return
    setRecorded((r) => new Set(r).add(step))
    store.record(STEP_CONCEPTS[step], correct, { misconceptionId, bkt: { guess: step === 2 ? 1 / 3 : 0.05 } })
  }

  const check = () => {
    setChecked(true)
    recordOnce(!!stepOk, stepOk ? undefined : limitingMisconception())
    if (stepOk) advance()
  }
  const reveal = () => {
    recordOnce(false)
    if (step === 2) setChoice(limitingKey)
    else setValues((v) => ({ ...v, ...Object.fromEntries(current.fields.map((f) => [f.id, fmt(f.expected, 4)])) }))
    setChecked(true)
  }

  const limitingText =
    result.limitingIndex === null ? '兩者剛好完全反應' : `限量試劑是 ${reaction.reactants[result.limitingIndex]}`

  return (
    <Card>
      <CardTitle>引導解題</CardTitle>
      <ol className="space-y-3">
        {steps.map((s, i) => {
          if (i > step) return null
          const active = i === step
          return (
            <li key={s.title} className={`rounded-lg border p-3 ${active ? 'border-accent' : 'border-line opacity-80'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{s.title}</span>
                {!active && <span className="text-sm text-good">✓</span>}
              </div>

              {!active ? (
                <p className="mt-1 text-sm text-ink-2">
                  {i === 2
                    ? limitingText
                    : s.fields.map((f) => (
                        <span key={f.id} className="mr-4 inline-block">
                          {f.label} = {fmt(f.expected)} {f.suffix}
                        </span>
                      ))}
                </p>
              ) : (
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-ink-2">{s.hint}</p>
                  {i === 2 ? (
                    <div className="flex flex-wrap gap-2">
                      {[...reaction.reactants, EXACT].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setChoice(key)
                            setChecked(false)
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-sm ${
                            choice === key ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2'
                          }`}
                        >
                          {key === EXACT ? '剛好都用完' : <Chem>{key}</Chem>}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {s.fields.map((f) => {
                        const bad = checked && !fieldOk(f)
                        return (
                          <label key={f.id} className="flex items-center gap-2 text-sm">
                            <span className="w-24 shrink-0">{f.label}</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              step="any"
                              value={values[f.id] ?? ''}
                              onChange={(e) => {
                                setValues((v) => ({ ...v, [f.id]: e.target.value }))
                                setChecked(false)
                              }}
                              aria-invalid={bad}
                              className={`w-full min-w-0 rounded-lg border bg-surface-2 px-2 py-1.5 font-mono ${
                                bad ? 'border-bad' : 'border-line'
                              }`}
                            />
                            <span className="w-8 text-ink-2">{f.suffix}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                  {checked && !stepOk && (
                    <Callout tone="bad">
                      {misconception ? (
                        <>
                          <strong>{MISCONCEPTIONS[misconception].nameZh}？</strong>
                          <span className="mt-1 block">
                            <ChemText>{MISCONCEPTIONS[misconception].explanation}</ChemText>
                          </span>
                        </>
                      ) : (
                        '還不對喔，再看一下提示。'
                      )}
                    </Callout>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {checked && stepOk ? (
                      <Button variant="primary" onClick={advance}>
                        下一步
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={check}>
                        檢查答案
                      </Button>
                    )}
                    <Button variant="ghost" onClick={reveal}>
                      看解答
                    </Button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      {done && (
        <div className="mt-3">
          <Callout tone="good">完成！{limitingText}，它決定了產物的量。下面是整理好的反應前後表。</Callout>
        </div>
      )}
    </Card>
  )
}
