import { Fragment, useState } from 'react'
import { REACTIONS, type Reaction } from '../../chem/equations'
import { molarMass, molarMassSteps } from '../../chem/formula'
import { fmt, solveLimiting, toMoles, UNIT_LABEL, type AmountUnit, type LimitingResult } from '../../chem/stoichiometry'
import { Chem } from '../../components/Chem'
import { ToolLayout } from '../../components/ToolLayout'
import { Card, CardTitle, Chip, Segmented } from '../../components/ui'
import { TOOLS } from '../registry'
import { GuidedSteps } from './GuidedSteps'

const TWO_REACTANT = REACTIONS.filter((r) => r.reactants.length === 2)

interface Input {
  amount: string
  unit: AmountUnit
}

const DEFAULT_INPUTS: Record<string, [Input, Input]> = {
  water: [
    { amount: '4', unit: 'g' },
    { amount: '16', unit: 'g' },
  ],
  methane: [
    { amount: '8', unit: 'g' },
    { amount: '48', unit: 'g' },
  ],
  magnesium: [
    { amount: '12', unit: 'g' },
    { amount: '12', unit: 'g' },
  ],
  zinc: [
    { amount: '13', unit: 'g' },
    { amount: '0.5', unit: 'mol' },
  ],
}

const defaultsFor = (r: Reaction): [Input, Input] =>
  DEFAULT_INPUTS[r.id] ?? [
    { amount: '1', unit: 'mol' },
    { amount: '1', unit: 'mol' },
  ]

type Mode = 'guided' | 'direct'
type View = 'mol' | 'g'

export default function Stoichiometry() {
  const [reaction, setReaction] = useState<Reaction>(TWO_REACTANT[0])
  const [inputs, setInputs] = useState<[Input, Input]>(() => defaultsFor(TWO_REACTANT[0]))
  const [mode, setMode] = useState<Mode>('guided')
  const [view, setView] = useState<View>('g')
  const [guideDone, setGuideDone] = useState(false)

  const moles = inputs.map((inp, i) => {
    const v = parseFloat(inp.amount)
    return Number.isFinite(v) && v > 0 ? toMoles(v, inp.unit, reaction.reactants[i]) : NaN
  }) as [number, number]
  const valid = moles.every((n) => Number.isFinite(n))
  const result = valid ? solveLimiting(reaction, moles) : null

  const pick = (r: Reaction) => {
    setReaction(r)
    setInputs(defaultsFor(r))
    setGuideDone(false)
  }
  const updateInput = (i: 0 | 1, patch: Partial<Input>) => {
    setInputs((prev) => {
      const next = [...prev] as [Input, Input]
      next[i] = { ...next[i], ...patch }
      return next
    })
    setGuideDone(false)
  }

  const nR = reaction.reactants.length
  const species = [...reaction.reactants, ...reaction.products]
  const equation = species
    .map((f, i) => `${reaction.coefficients[i] === 1 ? '' : reaction.coefficients[i]}${f}`)
    .reduce((acc, s, i) => (i === 0 ? s : `${acc} ${i === nR ? '->' : '+'} ${s}`), '')

  const showResult = result && (mode === 'direct' || guideDone)

  return (
    <ToolLayout meta={TOOLS.stoichiometry} concepts={<Concepts />}>
      <Card>
        <CardTitle>選一個反應</CardTitle>
        <div className="flex flex-wrap gap-2">
          {TWO_REACTANT.map((r) => (
            <Chip key={r.id} active={r.id === reaction.id} onClick={() => pick(r)}>
              {r.nameZh}
            </Chip>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg bg-surface-2 px-3 py-3 text-center text-xl font-semibold">
          <Chem>{equation}</Chem>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-2">
          {species.map((f) => (
            <span key={f}>
              <Chem>{f}</Chem> 分子量 {molarMassSteps(f)}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>投入的反應物</CardTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {reaction.reactants.map((f, i) => (
            <label key={`${reaction.id}-${f}`} className="block">
              <span className="mb-1 block text-sm">
                <Chem>{f}</Chem>
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={inputs[i].amount}
                  onChange={(e) => updateInput(i as 0 | 1, { amount: e.target.value })}
                  className="w-full min-w-0 rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono"
                />
                <select
                  value={inputs[i].unit}
                  onChange={(e) => updateInput(i as 0 | 1, { unit: e.target.value as AmountUnit })}
                  className="rounded-lg border border-line bg-surface-2 px-2 py-2 text-sm"
                >
                  {(Object.keys(UNIT_LABEL) as AmountUnit[]).map((u) => (
                    <option key={u} value={u}>
                      {UNIT_LABEL[u]}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          ))}
        </div>
        {!valid && <p className="mt-2 text-sm text-bad">請輸入大於 0 的數量。</p>}
        <div className="mt-4">
          <Segmented<Mode>
            value={mode}
            onChange={setMode}
            options={[
              { value: 'guided', label: '引導解題' },
              { value: 'direct', label: '直接看結果' },
            ]}
          />
        </div>
      </Card>

      {result && mode === 'guided' && (
        <GuidedSteps
          key={`${reaction.id}|${inputs.map((x) => x.amount + x.unit).join('|')}`}
          reaction={reaction}
          inputs={inputs}
          moles={moles}
          result={result}
          onDone={() => setGuideDone(true)}
        />
      )}

      {showResult && (
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <CardTitle>反應前後一覽</CardTitle>
            <Segmented<View>
              value={view}
              onChange={setView}
              options={[
                { value: 'g', label: '克' },
                { value: 'mol', label: '莫耳' },
              ]}
            />
          </div>
          <ResultTable reaction={reaction} result={result} view={view} />
          <AmountBars result={result} view={view} />
        </Card>
      )}
    </ToolLayout>
  )
}

function ResultTable({ reaction, result, view }: { reaction: Reaction; result: LimitingResult; view: View }) {
  const conv = (n: number, f: string) => (view === 'g' ? n * molarMass(f) : n)
  const unit = view === 'g' ? 'g' : 'mol'
  const tag = (i: number) => {
    if (i >= reaction.reactants.length) return null
    if (result.limitingIndex === null) return <Tag tone="bad">剛好用完</Tag>
    return i === result.limitingIndex ? <Tag tone="bad">限量試劑</Tag> : <Tag tone="warn">過量</Tag>
  }
  const rows: { label: string; key: 'initial' | 'change' | 'final' }[] = [
    { label: '反應前', key: 'initial' },
    { label: '變化量', key: 'change' },
    { label: '反應後', key: 'final' },
  ]
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-md text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="py-2 text-left font-medium text-ink-2">({unit})</th>
            {result.rows.map((r, i) => (
              <th key={r.formula} className="px-2 py-2 text-right font-semibold">
                <div className="flex flex-col items-end gap-1">
                  <Chem>{r.formula}</Chem>
                  {tag(i)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, key }) => (
            <tr key={key} className="border-b border-line last:border-0">
              <td className="py-2 text-ink-2">{label}</td>
              {result.rows.map((r) => {
                const v = conv(r[key], r.formula)
                return (
                  <td key={r.formula} className="px-2 py-2 text-right font-mono tabular-nums">
                    {key === 'change' && v > 0 ? '+' : ''}
                    {fmt(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Tag({ tone, children }: { tone: 'bad' | 'warn'; children: string }) {
  const style = tone === 'bad' ? 'bg-bad-soft text-bad' : 'bg-warn-soft text-warn'
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${style}`}>{children}</span>
}

/** 反應前、反應後各物質的量（長條圖），看出誰被用完、誰剩下 */
function AmountBars({ result, view }: { result: LimitingResult; view: View }) {
  const conv = (n: number, f: string) => (view === 'g' ? n * molarMass(f) : n)
  const values = result.rows.flatMap((r) => [conv(r.initial, r.formula), conv(r.final, r.formula)])
  const max = Math.max(...values, 1e-9)
  const unit = view === 'g' ? 'g' : 'mol'
  return (
    <div className="mt-5 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
      {result.rows.map((r) => (
        <Fragment key={r.formula}>
          <div className="font-semibold sm:pt-0.5">
            <Chem>{r.formula}</Chem>
          </div>
          <div className="space-y-1">
            <Bar label="前" value={conv(r.initial, r.formula)} max={max} unit={unit} muted />
            <Bar label="後" value={conv(r.final, r.formula)} max={max} unit={unit} />
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function Bar({ label, value, max, unit, muted }: { label: string; value: number; max: number; unit: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-xs text-ink-2">{label}</span>
      <div className="h-3 flex-1 rounded-full bg-surface-2">
        <div
          className={`h-3 rounded-full transition-all ${muted ? 'bg-ink-2/40' : 'bg-accent'}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-20 text-right font-mono text-xs tabular-nums">
        {fmt(value)} {unit}
      </span>
    </div>
  )
}

function Concepts() {
  return (
    <>
      <p>
        <strong>莫耳</strong>是「一堆」粒子的單位：1 莫耳 = 6×10²³ 個粒子。1 莫耳物質的質量（克）在數值上等於它的分子量，所以{' '}
        <strong>莫耳數 = 質量 ÷ 分子量</strong>。
      </p>
      <p>
        反應式的<strong>係數比 = 莫耳數比 = 分子個數比</strong>，但<strong>不等於質量比</strong>。例如{' '}
        <Chem>{'2H2 + O2 -> 2H2O'}</Chem>：2 莫耳氫氣配 1 莫耳氧氣，質量卻是 4 克配 32 克。
      </p>
      <p>
        兩種反應物不一定剛好用完。把各自的莫耳數除以係數，<strong>比值較小的先用完</strong>，稱為限量試劑；它決定了產物最多能生成多少。另一種會剩下，稱為過量試劑。
      </p>
    </>
  )
}
