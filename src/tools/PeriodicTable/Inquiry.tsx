import { useState } from 'react'
import { PERIODIC_TABLE, type PeriodicElement } from '../../chem/periodicTable'
import { ChemText } from '../../components/Chem'
import { Button, Callout, Card, CardTitle, Chip, Segmented } from '../../components/ui'
import type { Level } from '../../learning/concepts'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'
import { BohrModel } from './BohrModel'
import { TrendExplorer } from './TrendExplorer'

type Task = 'pattern' | 'alkali'

/** 探究任務：國中從數據找規律，高中探索週期趨勢 */
export function Inquiry({ params }: { params: URLSearchParams }) {
  const [level, setLevel] = useState<Level>(params.get('level') === 'senior' ? 'senior' : 'junior')
  const [task, setTask] = useState<Task>(params.get('task') === 'alkali' ? 'alkali' : 'pattern')
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {level === 'junior' ? (
            <>
              <Chip active={task === 'pattern'} onClick={() => setTask('pattern')}>
                任務一：找出週期表的規律
              </Chip>
              <Chip active={task === 'alkali'} onClick={() => setTask('alkali')}>
                任務二：鹼金屬誰最活潑
              </Chip>
            </>
          ) : (
            <span className="text-sm font-semibold">週期趨勢：原子半徑、游離能、電負度</span>
          )}
        </div>
        <Segmented<Level>
          value={level}
          onChange={setLevel}
          options={[
            { value: 'junior', label: '國中' },
            { value: 'senior', label: '高中' },
          ]}
        />
      </Card>
      {level === 'senior' ? (
        <TrendExplorer initialProp={params.get('prop')} />
      ) : task === 'pattern' ? (
        <PatternTask />
      ) : (
        <AlkaliTask />
      )}
    </div>
  )
}

// ---- 任務一：收集數據、找出規律 ----

const FIRST_20 = PERIODIC_TABLE.filter((e) => e.z <= 20)
const COLS = [1, 2, 13, 14, 15, 16, 17, 18]

interface PatternQuestion {
  id: string
  prompt: string
  options: { text: string; correct?: boolean; misconception?: string }[]
  explain: string
}

const PATTERN_QUESTIONS: PatternQuestion[] = [
  {
    id: 'group',
    prompt: '看你的紀錄：同一族（直行）的元素，最外層電子數有什麼規律？',
    options: [{ text: '都相同', correct: true }, { text: '由上往下增加' }, { text: '沒有規律' }],
    explain: '同一族最外層電子數相同，這就是同族元素化學性質相似的原因。',
  },
  {
    id: 'period',
    prompt: '同一週期（橫列）由左到右，最外層電子數怎麼變化？',
    options: [
      { text: '逐一增加', correct: true },
      { text: '都相同', misconception: 'same-period-same-properties' },
      { text: '逐一減少' },
    ],
    explain: '同一週期由左到右，每往右一格就多一個電子，最外層電子數逐一增加（直到填滿）。',
  },
  {
    id: 'shells',
    prompt: '元素所在的「週期數」和哪一項數據相同？',
    options: [{ text: '電子層數', correct: true }, { text: '最外層電子數' }, { text: '原子序' }],
    explain: '主族元素的週期數等於電子層數。例如鈉在第 3 週期，有 3 層電子。',
  },
]

function PatternTask() {
  const [log, setLog] = useState<PeriodicElement[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const { store } = useLearning()

  const add = (el: PeriodicElement) => setLog((l) => (l.some((x) => x.z === el.z) ? l : [...l, el]))
  const sameGroup = log.some((a) => log.some((b) => a.z !== b.z && a.group === b.group))
  const samePeriod = log.some((a) => log.some((b) => a.z !== b.z && a.period === b.period))
  const enough = log.length >= 6
  const ready = sameGroup && samePeriod && enough

  const answer = (q: PatternQuestion, i: number) => {
    if (q.id in answers) return
    setAnswers((a) => ({ ...a, [q.id]: i }))
    const opt = q.options[i]
    store.record('pt.structure', !!opt.correct, { misconceptionId: opt.misconception, bkt: { guess: 1 / 3 } })
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <CardTitle>① 點選元素，把數據記錄下來</CardTitle>
        <div className="overflow-x-auto">
          <div className="grid min-w-[26rem] grid-cols-8 gap-1">
            {COLS.map((g) => (
              <div key={g} className="text-center text-[10px] text-ink-2">
                {g} 族
              </div>
            ))}
            {[1, 2, 3, 4].flatMap((period) =>
              COLS.map((g) => {
                const el = FIRST_20.find((e) => e.period === period && e.group === g)
                if (!el) return <div key={`${period}-${g}`} />
                const logged = log.some((x) => x.z === el.z)
                return (
                  <button
                    key={el.z}
                    type="button"
                    onClick={() => add(el)}
                    aria-pressed={logged}
                    className={`rounded-md border px-1 py-1.5 text-center transition ${logged ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2'}`}
                  >
                    <div className="text-sm font-bold">{el.symbol}</div>
                    <div className="text-[10px] text-ink-2">{el.nameZh}</div>
                  </button>
                )
              }),
            )}
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Check ok={sameGroup}>記錄同一族的兩個元素</Check>
          <Check ok={samePeriod}>記錄同一週期的兩個元素</Check>
          <Check ok={enough}>{`至少記錄 6 個元素（目前 ${log.length} 個）`}</Check>
        </ul>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <CardTitle>② 我的觀察紀錄</CardTitle>
          {log.length > 0 && (
            <Button variant="ghost" onClick={() => setLog([])}>
              清空
            </Button>
          )}
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-ink-2">還沒有紀錄。點上面的元素開始收集數據。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-md text-sm">
              <thead className="text-ink-2">
                <tr className="border-b border-line text-left">
                  <th className="py-1.5 font-medium">元素</th>
                  <th className="py-1.5 font-medium">週期</th>
                  <th className="py-1.5 font-medium">族</th>
                  <th className="py-1.5 font-medium">電子排列</th>
                  <th className="py-1.5 font-medium">電子層數</th>
                  <th className="py-1.5 font-medium">最外層電子數</th>
                </tr>
              </thead>
              <tbody>
                {[...log]
                  .sort((a, b) => a.z - b.z)
                  .map((el) => (
                    <tr key={el.z} className="border-b border-line last:border-0">
                      <td className="py-1.5">
                        {el.nameZh} {el.symbol}
                      </td>
                      <td className="py-1.5 font-mono">{el.period}</td>
                      <td className="py-1.5 font-mono">{el.group}</td>
                      <td className="py-1.5 font-mono">{el.shells.join(', ')}</td>
                      <td className="py-1.5 font-mono">{el.shells.length}</td>
                      <td className="py-1.5 font-mono">{el.shells.at(-1)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <CardTitle>③ 從數據找出規律</CardTitle>
        {!ready ? (
          <p className="text-sm text-ink-2">完成上面三項記錄後，就可以回答問題。提示：可以挑一整個直行，再挑一整個橫列。</p>
        ) : (
          PATTERN_QUESTIONS.map((q) => {
            const picked = answers[q.id]
            const opt = picked === undefined ? undefined : q.options[picked]
            return (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium">{q.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((o, i) => (
                    <Chip key={o.text} active={picked === i} onClick={() => answer(q, i)}>
                      {o.text}
                    </Chip>
                  ))}
                </div>
                {opt && (
                  <Callout tone={opt.correct ? 'good' : 'bad'}>
                    {opt.correct ? '對！' : '再看看你的紀錄表。'}
                    {q.explain}
                    {opt.misconception && (
                      <span className="mt-1 block">
                        <ChemText>{MISCONCEPTIONS[opt.misconception].explanation}</ChemText>
                      </span>
                    )}
                  </Callout>
                )}
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}

function Check({ ok, children }: { ok: boolean; children: string }) {
  return (
    <li className={ok ? 'text-good' : 'text-ink-2'}>
      {ok ? '✓' : '○'} {children}
    </li>
  )
}

// ---- 任務二：鹼金屬與水 ----

const ALKALI = [
  { symbol: 'Na', obs: '熔成銀白色的小球，在水面上快速游動，發出嘶嘶聲。' },
  { symbol: 'K', obs: '反應非常劇烈，產生紫色火焰，甚至可能爆裂。' },
  { symbol: 'Li', obs: '在水面上游動，慢慢冒出氣泡。' },
]
const CORRECT_ORDER = ['K', 'Na', 'Li']

function AlkaliTask() {
  const [order, setOrder] = useState<string[]>([])
  const { store } = useLearning()
  const done = order.length === 3
  const correct = done && order.every((s, i) => s === CORRECT_ORDER[i])

  const pick = (symbol: string) => {
    if (order.includes(symbol) || done) return
    const next = [...order, symbol]
    setOrder(next)
    if (next.length === 3) {
      store.record('pt.group-trend', next.every((s, i) => s === CORRECT_ORDER[i]), { bkt: { guess: 1 / 6 } })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <CardTitle>把鋰、鈉、鉀分別放入水中，觀察紀錄如下。請依「反應劇烈程度」由大到小依序點選。</CardTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {ALKALI.map(({ symbol, obs }) => {
            const el = PERIODIC_TABLE.find((e) => e.symbol === symbol)!
            const rank = order.indexOf(symbol)
            return (
              <button
                key={symbol}
                type="button"
                onClick={() => pick(symbol)}
                disabled={rank !== -1 || done}
                className={`rounded-xl border p-3 text-left transition ${rank !== -1 ? 'border-accent bg-accent-soft' : 'border-line hover:bg-surface-2'}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold">
                    {el.nameZh} {el.symbol}
                  </span>
                  {rank !== -1 && <span className="text-sm font-semibold text-accent">第 {rank + 1}</span>}
                </div>
                <p className="mt-1 text-sm text-ink-2">{obs}</p>
              </button>
            )
          })}
        </div>
        {order.length > 0 && !done && <p className="text-xs text-ink-2">已選：{order.join(' > ')}</p>}
        {done && (
          <Callout tone={correct ? 'good' : 'bad'}>
            {correct ? '排序正確：鉀 > 鈉 > 鋰。' : `你的排序是 ${order.join(' > ')}，正確是 K > Na > Li。`}
          </Callout>
        )}
        {done && (
          <Button variant="ghost" onClick={() => setOrder([])}>
            重新排序
          </Button>
        )}
      </Card>

      {done && (
        <Card className="space-y-3">
          <CardTitle>為什麼？看看它們的電子排列</CardTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Li', 'Na', 'K'].map((s) => {
              const el = PERIODIC_TABLE.find((e) => e.symbol === s)!
              return (
                <div key={s} className="text-center">
                  <BohrModel element={el} />
                  <div className="text-sm font-semibold">
                    {el.nameZh}：{el.shells.join(', ')}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-sm">
            三者最外層都只有 1 個電子，所以性質相似（都會和水反應產生氫氣）。但由鋰到鉀，電子層越來越多，最外層電子離原子核越遠、受到的吸引越弱，越容易失去，所以反應越劇烈。
          </p>
          <p className="text-xs text-ink-2">圖中是國中使用的波耳模型，未依實際比例。</p>
        </Card>
      )}
    </div>
  )
}
