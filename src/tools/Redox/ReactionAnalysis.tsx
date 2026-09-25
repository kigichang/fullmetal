import { useState } from 'react'
import { analyzeRedox, formatOx, oxidationNumbers, parseSpecies, REDOX_REACTIONS, type RedoxReaction } from '../../chem/redox'
import { Chem, ChemText } from '../../components/Chem'
import { Button, Callout, Card, CardTitle, Chip, Segmented } from '../../components/ui'
import type { Level } from '../../learning/concepts'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'

const NOT_REDOX = '__none__'

/** 反應分析：國中看得氧失氧，高中看氧化數與電子轉移 */
export function ReactionAnalysis({ params }: { params: URLSearchParams }) {
  const [level, setLevel] = useState<Level>(params.get('level') === 'senior' ? 'senior' : 'junior')
  const [reaction, setReaction] = useState<RedoxReaction>(() => REDOX_REACTIONS.find((r) => r.id === params.get('rx')) ?? REDOX_REACTIONS[0])
  const [choice, setChoice] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const { store } = useLearning()

  const analysis = analyzeRedox(reaction)
  const juniorOk = !!reaction.oxygenView
  const mode: Level = level === 'junior' && !juniorOk ? 'senior' : level
  const reactants = reaction.reactants.map(([, sp]) => sp)

  const correctChoice = (c: string) =>
    mode === 'junior' ? c === reaction.oxygenView!.gainsO : analysis.isRedox ? analysis.reducingAgents.includes(c) : c === NOT_REDOX

  const pick = (r: RedoxReaction) => {
    setReaction(r)
    setChoice(null)
    setRevealed(false)
  }

  const answer = (c: string) => {
    if (choice !== null) return
    setChoice(c)
    setRevealed(true)
    const ok = correctChoice(c)
    store.record(mode === 'junior' ? 'redox.oxygen' : 'redox.oxidation-number', ok, {
      misconceptionId: ok ? undefined : misFor(c),
      bkt: { guess: 1 / (reactants.length + (mode === 'senior' ? 1 : 0)) },
    })
  }

  const mis = choice && !correctChoice(choice) ? misFor(choice) : undefined
  function misFor(c: string): string | undefined {
    if (mode === 'junior' && c === reaction.oxygenView!.losesO) return 'contains-o-is-oxidized'
    if (mode === 'senior' && c === NOT_REDOX && analysis.isRedox && !reactants.some((s) => 'O' in parseSpecies(s).atoms)) return 'oxidation-needs-oxygen'
    if (mode === 'senior' && analysis.oxidizingAgents.includes(c)) return 'agent-confusion'
    return undefined
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>選一個反應</CardTitle>
          <Segmented<Level>
            value={level}
            onChange={(l) => {
              setLevel(l)
              setChoice(null)
              setRevealed(false)
            }}
            options={[
              { value: 'junior', label: '國中（得氧、失氧）' },
              { value: 'senior', label: '高中（氧化數）' },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {REDOX_REACTIONS.map((r) => (
            <Chip key={r.id} active={r.id === reaction.id} onClick={() => pick(r)}>
              {r.nameZh}
              {level === 'junior' && !r.oxygenView && <span className="ml-1 text-xs opacity-75">高中</span>}
            </Chip>
          ))}
        </div>
        {level === 'junior' && !juniorOk && (
          <Callout tone="info">這個反應沒有「得氧、失氧」可以判斷，要用高中的氧化數來分析，下面已自動切換成高中觀點。</Callout>
        )}
        <div className="overflow-x-auto rounded-lg bg-surface-2 px-3 py-4 text-center">
          <AnnotatedEquation reaction={reaction} showOx={mode === 'senior' && revealed} />
        </div>
        {reaction.note && revealed && <p className="text-sm text-ink-2">{reaction.note}</p>}
      </Card>

      <Card className="space-y-3">
        <CardTitle>{mode === 'junior' ? '哪一個反應物被氧化（得到氧）？' : '哪一個反應物是還原劑（本身被氧化）？'}</CardTitle>
        <div className="flex flex-wrap gap-2">
          {[...reactants, ...(mode === 'senior' ? [NOT_REDOX] : [])].map((c) => {
            const state = choice === null ? 'idle' : correctChoice(c) ? 'correct' : c === choice ? 'wrong' : 'idle'
            const style = { idle: '', correct: 'border-good bg-good-soft', wrong: 'border-bad bg-bad-soft' }[state]
            return (
              <button
                key={c}
                type="button"
                onClick={() => answer(c)}
                disabled={choice !== null}
                className={`rounded-lg border border-line px-3 py-1.5 text-sm transition hover:bg-surface-2 disabled:cursor-default ${style}`}
              >
                {c === NOT_REDOX ? '不是氧化還原反應' : <Chem>{c}</Chem>}
              </button>
            )
          })}
          {!revealed && (
            <Button variant="ghost" onClick={() => setRevealed(true)}>
              直接看解析
            </Button>
          )}
        </div>
        {choice && (
          <Callout tone={correctChoice(choice) ? 'good' : 'bad'}>
            {correctChoice(choice) ? '答對了！' : '再看看下面的解析。'}
            {mis && (
              <span className="mt-1 block">
                <ChemText>{MISCONCEPTIONS[mis].explanation}</ChemText>
              </span>
            )}
          </Callout>
        )}
        {revealed && (mode === 'junior' ? <OxygenExplanation reaction={reaction} /> : <OxidationExplanation reaction={reaction} />)}
      </Card>

      <OxidationCalculator suggestions={[...new Set([...reactants, ...reaction.products.map(([, s]) => s)])]} />
    </div>
  )
}

/** 反應式；高中模式在每個元素上方標出氧化數 */
function AnnotatedEquation({ reaction, showOx }: { reaction: RedoxReaction; showOx: boolean }) {
  const side = (list: [number, string][]) =>
    list.map(([coef, sp], i) => (
      <span key={sp} className="inline-flex items-end">
        {i > 0 && <span className="mx-2 pb-0.5">+</span>}
        {coef > 1 && <span className="mr-0.5 pb-0.5 text-lg">{coef}</span>}
        <SpeciesWithOx species={sp} showOx={showOx} />
      </span>
    ))
  return (
    <div className="inline-flex flex-wrap items-end justify-center gap-y-2 text-lg">
      {side(reaction.reactants)}
      <span className="mx-3 pb-0.5">→</span>
      {side(reaction.products)}
    </div>
  )
}

function SpeciesWithOx({ species, showOx }: { species: string; showOx: boolean }) {
  const { atoms, charge } = parseSpecies(species)
  const ox = oxidationNumbers(species).numbers
  return (
    <span className="inline-flex items-end">
      {Object.entries(atoms).map(([el, n]) => (
        <span key={el} className="inline-flex flex-col items-center px-px">
          <span className={`h-4 font-mono text-[11px] leading-4 ${showOx ? 'text-accent' : 'invisible'}`}>{formatOx(Math.round(ox[el] * 100) / 100)}</span>
          <span>
            {el}
            {n > 1 && <sub>{n}</sub>}
          </span>
        </span>
      ))}
      {charge !== 0 && (
        <sup className="pb-3">
          {Math.abs(charge) > 1 ? Math.abs(charge) : ''}
          {charge > 0 ? '+' : '−'}
        </sup>
      )}
    </span>
  )
}

function OxygenExplanation({ reaction }: { reaction: RedoxReaction }) {
  const { gainsO, losesO } = reaction.oxygenView!
  return (
    <div className="grid gap-2 text-sm sm:grid-cols-2">
      <div className="rounded-lg border border-line p-3">
        <div className="font-semibold">
          <Chem>{gainsO}</Chem> 得到氧
        </div>
        <p className="text-ink-2">
          → 被<strong className="text-ink">氧化</strong>，它是<strong className="text-ink">還原劑</strong>
        </p>
      </div>
      <div className="rounded-lg border border-line p-3">
        <div className="font-semibold">
          <Chem>{losesO}</Chem> {losesO === 'O2' ? '把氧給了別人' : '失去氧'}
        </div>
        <p className="text-ink-2">
          → 被<strong className="text-ink">還原</strong>，它是<strong className="text-ink">氧化劑</strong>
        </p>
      </div>
      <p className="text-xs text-ink-2 sm:col-span-2">氧化和還原一定同時發生：有物質得到氧，就有物質失去氧。高中會改用「電子轉移」來定義，可以切換到高中觀點看看。</p>
    </div>
  )
}

function OxidationExplanation({ reaction }: { reaction: RedoxReaction }) {
  const a = analyzeRedox(reaction)
  if (!a.isRedox) {
    return <Callout tone="info">所有元素的氧化數在反應前後都沒有改變，所以不是氧化還原反應。</Callout>
  }
  const label = { oxidized: '升高 → 被氧化', reduced: '降低 → 被還原', both: '部分升高、部分降低', none: '不變' } as const
  return (
    <div className="space-y-3 text-sm">
      <table className="w-full">
        <thead className="text-ink-2">
          <tr className="border-b border-line">
            <th className="py-1 text-left font-medium">元素</th>
            <th className="py-1 text-left font-medium">反應前</th>
            <th className="py-1 text-left font-medium">反應後</th>
            <th className="py-1 text-left font-medium">氧化數</th>
          </tr>
        </thead>
        <tbody>
          {a.elements.map((e) => (
            <tr key={e.element} className="border-b border-line last:border-0">
              <td className="py-1 font-semibold">{e.element}</td>
              <td className="py-1 font-mono">{[...new Set(e.from.map((f) => formatOx(f.n)))].join('、')}</td>
              <td className="py-1 font-mono">{[...new Set(e.to.map((f) => formatOx(f.n)))].join('、')}</td>
              <td className={`py-1 ${e.change === 'oxidized' ? 'text-bad' : e.change === 'reduced' ? 'text-accent' : 'text-ink-2'}`}>{label[e.change]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-line p-3">
          還原劑（失去電子、本身被氧化）：
          {a.reducingAgents.map((s) => (
            <Chem key={s} className="ml-1 font-semibold">
              {s}
            </Chem>
          ))}
        </div>
        <div className="rounded-lg border border-line p-3">
          氧化劑（得到電子、本身被還原）：
          {a.oxidizingAgents.map((s) => (
            <Chem key={s} className="ml-1 font-semibold">
              {s}
            </Chem>
          ))}
        </div>
      </div>
      <ElectronTransfer from={a.reducingAgents.join('、')} to={a.oxidizingAgents.join('、')} count={a.electrons} />
    </div>
  )
}

/** 電子由還原劑流向氧化劑的示意 */
function ElectronTransfer({ from, to, count }: { from: string; to: string; count: number }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <div className="flex items-center gap-3">
        <span className="shrink-0 font-semibold">{chemLabel(from)}</span>
        <div className="relative h-6 flex-1 overflow-hidden">
          <div className="absolute top-1/2 h-px w-full bg-ink-2" />
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className="absolute top-0 rounded-full bg-accent px-1 text-[10px] leading-6 text-accent-ink"
              style={{ animation: `electron-flow 2.4s linear ${i * 0.8}s infinite` }}
            >
              e⁻
            </span>
          ))}
        </div>
        <span className="shrink-0 font-semibold">{chemLabel(to)}</span>
      </div>
      <p className="mt-1 text-xs text-ink-2">依反應式的係數，共轉移 {count} 個電子；失去的電子數 = 得到的電子數。</p>
    </div>
  )
}

const chemLabel = (s: string) => s.split('、').map((x) => <Chem key={x}>{x}</Chem>)

/** 氧化數計算機：輸入任何物種，列出依規則推導的步驟 */
function OxidationCalculator({ suggestions }: { suggestions: string[] }) {
  const [input, setInput] = useState('KMnO4')
  const [showSteps, setShowSteps] = useState(false)
  let result: ReturnType<typeof oxidationNumbers> | null = null
  let error = ''
  try {
    result = input.trim() ? oxidationNumbers(input.trim()) : null
  } catch {
    error = '無法用課本規則推算這個物種（請確認化學式，例如 Cr2O7^2-、NH4^+）。'
  }
  const examples = [...suggestions, 'KMnO4', 'Cr2O7^2-', 'H2O2', 'NaH', 'NH3', 'SO4^2-']
  return (
    <Card className="space-y-3">
      <CardTitle>氧化數推算（高中）</CardTitle>
      <div className="flex flex-wrap gap-2">
        {[...new Set(examples)].map((s) => (
          <Chip
            key={s}
            active={input === s}
            onClick={() => {
              setInput(s)
              setShowSteps(false)
            }}
          >
            <Chem>{s}</Chem>
          </Chip>
        ))}
      </div>
      <label className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-2">或輸入化學式（電荷用 ^，例如 NO3^-）</span>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSteps(false)
          }}
          className="w-40 rounded-lg border border-line bg-surface-2 px-2 py-1 font-mono"
          aria-label="要推算氧化數的化學式"
        />
      </label>
      {error && <p className="text-sm text-bad">{error}</p>}
      {result && (
        <div className="space-y-2">
          <div className="text-lg">
            <SpeciesWithOx species={input.trim()} showOx={showSteps} />
          </div>
          {showSteps ? (
            <ol className="list-decimal space-y-0.5 pl-5 text-sm">
              {result.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          ) : (
            <Button onClick={() => setShowSteps(true)}>先自己算，再看答案與推導</Button>
          )}
        </div>
      )}
    </Card>
  )
}
