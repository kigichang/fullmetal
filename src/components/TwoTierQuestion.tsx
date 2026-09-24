import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVEL_LABEL, type Level } from '../learning/concepts'
import { MISCONCEPTIONS } from '../learning/misconceptions'
import { grade, type Choice, type GradeResult, type TwoTierQuestion as Question } from '../learning/twoTier'
import { useLearning } from '../learning/useLearning'
import { ChemText } from './Chem'
import { Button, Callout, Card, CardTitle, Chip } from './ui'

/** 兩階層診斷題：先選答案、再選理由，依迷思給針對性回饋 */
export function TwoTierQuestion({ question: q, onGraded }: { question: Question; onGraded?: (r: GradeResult) => void }) {
  const { store } = useLearning()
  const [option, setOption] = useState<number | null>(null)
  const [reason, setReason] = useState<number | null>(null)
  const [result, setResult] = useState<GradeResult | null>(null)

  const submit = () => {
    if (option === null || reason === null) return
    const r = grade(q, option, reason)
    setResult(r)
    store.record(q.concept, r.verdict === 'correct', {
      misconceptionId: r.misconception,
      bkt: { guess: 1 / (q.options.length * q.reasons.length) },
    })
    onGraded?.(r)
  }

  const locked = result !== null
  const correctOption = q.options.findIndex((o) => o.correct)
  const correctReason = q.reasons.findIndex((o) => o.correct)
  const mis = result?.misconception ? MISCONCEPTIONS[result.misconception] : undefined

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed font-medium">
        <ChemText>{q.stem}</ChemText>
      </p>

      <ChoiceList
        title="① 你的答案"
        choices={q.options}
        value={option}
        onChange={(i) => {
          setOption(i)
          setReason(null)
        }}
        locked={locked}
        correctIdx={correctOption}
      />

      {option !== null && (
        <ChoiceList
          title="② 你為什麼這樣選？"
          choices={q.reasons}
          value={reason}
          onChange={setReason}
          locked={locked}
          correctIdx={correctReason}
        />
      )}

      {!locked && (
        <Button variant="primary" onClick={submit} disabled={option === null || reason === null}>
          送出
        </Button>
      )}

      {result && (
        <div className="space-y-2">
          {result.verdict === 'correct' && <Callout tone="good">答案和理由都正確！</Callout>}
          {result.verdict === 'right-answer-wrong-reason' && (
            <Callout tone="warn">答案對了，但理由不對。答對不代表觀念清楚，看看下面的說明。</Callout>
          )}
          {result.verdict === 'wrong' && <Callout tone="bad">這題答錯了，正確的答案和理由已經用綠色標出。</Callout>}
          {mis && (
            <div className="rounded-lg border border-line bg-surface-2 p-3 text-sm">
              <div className="font-semibold">常見迷思：{mis.nameZh}</div>
              <p className="mt-1 leading-relaxed text-ink-2">
                <ChemText>{mis.explanation}</ChemText>
              </p>
              <Link to={mis.remedy.link} className="mt-2 inline-block font-medium text-accent underline underline-offset-4">
                {mis.remedy.label} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ChoiceList({
  title,
  choices,
  value,
  onChange,
  locked,
  correctIdx,
}: {
  title: string
  choices: Choice[]
  value: number | null
  onChange: (i: number) => void
  locked: boolean
  correctIdx: number
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold text-ink-2">{title}</legend>
      {choices.map((c, i) => {
        const chosen = value === i
        const state = locked ? (i === correctIdx ? 'correct' : chosen ? 'wrong' : 'idle') : chosen ? 'chosen' : 'idle'
        const style = {
          idle: 'border-line hover:bg-surface-2',
          chosen: 'border-accent bg-accent-soft',
          correct: 'border-good bg-good-soft',
          wrong: 'border-bad bg-bad-soft',
        }[state]
        return (
          <button
            key={i}
            type="button"
            disabled={locked}
            aria-pressed={chosen}
            onClick={() => onChange(i)}
            className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition disabled:cursor-default ${style}`}
          >
            <span className="font-mono text-ink-2">{String.fromCharCode(65 + i)}</span>
            <span className="leading-relaxed">
              <ChemText>{c.text}</ChemText>
            </span>
          </button>
        )
      })}
    </fieldset>
  )
}

/** 一組診斷題：可依國中／高中篩選，逐題作答，最後顯示結果摘要 */
export function DiagnosticSet({ questions, title = '診斷挑戰' }: { questions: Question[]; title?: string }) {
  const [level, setLevel] = useState<Level | 'all'>('junior')
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<GradeResult[]>([])
  const list = questions.filter((q) => level === 'all' || q.level === level)
  const q = list[index]
  const answered = results.length > index

  const changeLevel = (l: Level | 'all') => {
    setLevel(l)
    setIndex(0)
    setResults([])
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {(['junior', 'senior', 'all'] as const).map((l) => (
            <Chip key={l} active={level === l} onClick={() => changeLevel(l)}>
              {l === 'all' ? '全部' : LEVEL_LABEL[l]}
            </Chip>
          ))}
        </div>
      </div>
      <p className="text-xs text-ink-2">每題要選答案，也要選理由。只有兩者都正確才算真的懂。</p>

      {q ? (
        <>
          <div className="text-xs font-semibold text-ink-2">
            第 {index + 1} / {list.length} 題・{LEVEL_LABEL[q.level]}
          </div>
          <TwoTierQuestion key={q.id} question={q} onGraded={(r) => setResults((rs) => [...rs, r])} />
          {answered && (
            <Button variant="primary" onClick={() => setIndex((i) => i + 1)}>
              {index + 1 < list.length ? '下一題' : '看結果'}
            </Button>
          )}
        </>
      ) : (
        <Summary results={results} onRestart={() => changeLevel(level)} />
      )}
    </Card>
  )
}

function Summary({ results, onRestart }: { results: GradeResult[]; onRestart: () => void }) {
  const correct = results.filter((r) => r.verdict === 'correct').length
  const lucky = results.filter((r) => r.verdict === 'right-answer-wrong-reason').length
  return (
    <div className="space-y-3">
      <div className="text-lg font-bold">
        完全答對 {correct} / {results.length} 題
      </div>
      {lucky > 0 && <p className="text-sm text-warn">有 {lucky} 題答案對但理由不對，這些觀念值得再複習。</p>}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onRestart}>再做一次</Button>
        <Link to="/progress" className="self-center text-sm font-medium text-accent underline underline-offset-4">
          看我的學習紀錄 →
        </Link>
      </div>
    </div>
  )
}
