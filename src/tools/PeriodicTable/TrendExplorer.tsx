import { useRef, useState, type PointerEvent } from 'react'
import {
  EXPECTED_TREND,
  MAIN_GROUP,
  MAIN_GROUP_LABELS,
  mainGroupColumn,
  PROPERTY_INFO,
  trendValue,
  type Direction,
  type TrendProperty,
} from '../../chem/periodicTrends'
import type { PeriodicElement } from '../../chem/periodicTable'
import { ChemText } from '../../components/Chem'
import { Button, Callout, Card, CardTitle, Chip } from '../../components/ui'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'
import { useWidth } from '../../lib/useWidth'
import { niceStep } from '../../lib/scale'

const PROPS: TrendProperty[] = ['radius', 'ie', 'en']
type Answer = Direction | 'same'
const ANSWER_LABEL: Record<Answer, string> = { increase: '變大', decrease: '變小', same: '差不多' }

const fmtValue = (p: TrendProperty, v: number) => v.toFixed(PROPERTY_INFO[p].digits)

/** 高中：先預測趨勢，再用熱度圖與數據圖驗證 */
export function TrendExplorer({ initialProp }: { initialProp: string | null }) {
  const [prop, setProp] = useState<TrendProperty>(PROPS.includes(initialProp as TrendProperty) ? (initialProp as TrendProperty) : 'radius')
  const [answers, setAnswers] = useState<Partial<Record<TrendProperty, { across?: Answer; down?: Answer }>>>({})
  const [revealed, setRevealed] = useState<Partial<Record<TrendProperty, boolean>>>({})
  const { store } = useLearning()
  const info = PROPERTY_INFO[prop]
  const mine = answers[prop] ?? {}
  const shown = !!revealed[prop]

  const answer = (dir: 'across' | 'down', a: Answer) => {
    if (shown) return
    const next = { ...mine, [dir]: a }
    setAnswers((all) => ({ ...all, [prop]: next }))
    if (next.across && next.down) {
      const expected = EXPECTED_TREND[prop]
      const correct = next.across === expected.across && next.down === expected.down
      const misconceptionId = prop === 'radius' && next.across === 'increase' ? 'bigger-z-bigger-atom' : undefined
      store.record('pt.trends', correct, { misconceptionId, bkt: { guess: 1 / 9 } })
      setRevealed((r) => ({ ...r, [prop]: true }))
    }
  }

  const verdict = (dir: 'across' | 'down') => (mine[dir] ? mine[dir] === EXPECTED_TREND[prop][dir] : null)

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {PROPS.map((p) => (
            <Chip key={p} active={p === prop} onClick={() => setProp(p)}>
              {PROPERTY_INFO[p].nameZh}
            </Chip>
          ))}
        </div>
        <p className="text-sm text-ink-2">{info.note}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {(['across', 'down'] as const).map((dir) => (
            <div key={dir} className="rounded-lg border border-line p-3">
              <p className="text-sm font-medium">
                預測：{dir === 'across' ? '同一週期由左到右' : '同一族由上到下'}，{info.nameZh}會？
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['increase', 'decrease', 'same'] as Answer[]).map((a) => (
                  <Chip key={a} active={mine[dir] === a} onClick={() => answer(dir, a)}>
                    {ANSWER_LABEL[a]}
                  </Chip>
                ))}
              </div>
              {shown && mine[dir] && (
                <p className={`mt-2 text-sm ${verdict(dir) ? 'text-good' : 'text-bad'}`}>
                  {verdict(dir) ? '✓ 預測正確' : `✗ 大致上是${ANSWER_LABEL[EXPECTED_TREND[prop][dir]]}`}
                </p>
              )}
            </div>
          ))}
        </div>
        {!shown && (
          <Button variant="ghost" onClick={() => setRevealed((r) => ({ ...r, [prop]: true }))}>
            不預測，直接看數據
          </Button>
        )}
        {shown && prop === 'radius' && mine.across === 'increase' && (
          <Callout tone="bad">
            <ChemText>{MISCONCEPTIONS['bigger-z-bigger-atom'].explanation}</ChemText>
          </Callout>
        )}
      </Card>

      {shown ? (
        <>
          <Card>
            <CardTitle>
              {info.nameZh}熱度圖（主族元素{info.unit ? `，單位 ${info.unit}` : ''}）
            </CardTitle>
            <Heatmap prop={prop} />
          </Card>
          <Card>
            <CardTitle>{info.nameZh}與原子序</CardTitle>
            <PropertyChart prop={prop} />
          </Card>
          <Card className="space-y-2 text-sm">
            <CardTitle>解釋</CardTitle>
            <Explanation prop={prop} />
          </Card>
        </>
      ) : (
        <Callout tone="info">先回答上面兩個預測，再看數據驗證你的想法。</Callout>
      )}
    </div>
  )
}

function Explanation({ prop }: { prop: TrendProperty }) {
  if (prop === 'radius')
    return (
      <p>
        同一週期電子層數相同，但核電荷由左到右增加，對電子吸引力變強，半徑變小；同一族由上到下多了電子層，半徑變大。所以週期表<strong>左下角的原子最大</strong>。
      </p>
    )
  if (prop === 'ie')
    return (
      <>
        <p>
          原子越小、核對最外層電子吸引越強，越難移去電子，游離能越大。每個週期的<strong>鈍氣最高、鹼金屬最低</strong>，所以圖形呈鋸齒狀，這就是「週期性」。
        </p>
        <p className="text-ink-2">
          例外：Be → B、Mg → Al 下降，因為 B、Al 要移去的是能量較高的 p 電子；N → O、P → S 下降，因為 O、S 的 p 軌域中有一對成對電子互相排斥，較容易移去一個。
        </p>
      </>
    )
  return (
    <p>
      電負度和游離能的趨勢相似：同一週期由左到右變大、同一族由上到下變小，<strong>氟（3.98）最大</strong>。電負度差越大的兩原子，形成的鍵極性越大。
    </p>
  )
}

function Heatmap({ prop }: { prop: TrendProperty }) {
  const values = MAIN_GROUP.map((e) => trendValue(e.symbol, prop)).filter((v): v is number => v !== undefined)
  const min = Math.min(...values)
  const max = Math.max(...values)
  // 單一色相由淺到深（sequential）；上限 70% 以保持文字對比
  const tint = (v: number) => `color-mix(in oklab, var(--series-1) ${Math.round(10 + ((v - min) / (max - min)) * 60)}%, var(--surface))`
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className="grid min-w-[30rem] gap-1" style={{ gridTemplateColumns: '1.5rem repeat(8, minmax(0, 1fr))' }}>
          <div />
          {MAIN_GROUP_LABELS.map((g) => (
            <div key={g} className="text-center text-[10px] text-ink-2">
              {g} 族
            </div>
          ))}
          {[1, 2, 3, 4, 5, 6].map((period) => (
            <HeatRow key={period} period={period} prop={prop} tint={tint} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-ink-2">
        <span>{fmtValue(prop, min)}</span>
        <span className="h-2.5 w-40 rounded" style={{ background: `linear-gradient(to right, ${tint(min)}, ${tint(max)})` }} />
        <span>{fmtValue(prop, max)}</span>
        <span className="ml-2">虛線格＝無數據</span>
      </div>
      <p className="text-xs text-ink-2">過渡元素（第 3–12 族）未列入。</p>
    </div>
  )
}

function HeatRow({ period, prop, tint }: { period: number; prop: TrendProperty; tint: (v: number) => string }) {
  const cells = Array<PeriodicElement | undefined>(8)
  MAIN_GROUP.filter((e) => e.period === period).forEach((e) => (cells[mainGroupColumn(e)] = e))
  return (
    <>
      <div className="flex items-center justify-center text-[10px] text-ink-2">{period}</div>
      {Array.from({ length: 8 }, (_, i) => {
        const el = cells[i]
        if (!el) return <div key={i} />
        const v = trendValue(el.symbol, prop)
        return (
          <div
            key={i}
            className={`rounded-md border px-1 py-1 text-center ${v === undefined ? 'border-dashed border-line' : 'border-transparent'}`}
            style={{ background: v === undefined ? undefined : tint(v) }}
            title={`${el.nameZh} ${el.symbol}：${v === undefined ? '無數據' : fmtValue(prop, v)}`}
          >
            <div className="text-xs font-bold">{el.symbol}</div>
            <div className="font-mono text-[10px]">{v === undefined ? '—' : fmtValue(prop, v)}</div>
          </div>
        )
      })}
    </>
  )
}

const PAD = { top: 16, right: 16, bottom: 30, left: 48 }
const HEIGHT = 240

/** 性質對原子序的點線圖：第 1 族與第 18（或 17）族另外標色，看出週期性 */
function PropertyChart({ prop }: { prop: TrendProperty }) {
  const wrap = useRef<HTMLDivElement>(null)
  const width = useWidth(wrap)
  const [hover, setHover] = useState<PeriodicElement | null>(null)
  const pts = MAIN_GROUP.map((e) => ({ e, v: trendValue(e.symbol, prop) })).filter((p): p is { e: PeriodicElement; v: number } => p.v !== undefined)
  const maxZ = pts.at(-1)!.e.z
  const maxV = Math.max(...pts.map((p) => p.v))
  const step = niceStep(maxV)
  const yMax = Math.ceil((maxV * 1.05) / step) * step
  const plotW = width - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const x = (z: number) => PAD.left + ((z - 1) / (maxZ - 1)) * plotW
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH
  const accentGroup = prop === 'ie' ? 18 : 17
  // 氫在第 1 族但不是鹼金屬，所以用分類判斷
  const isAlkali = (e: PeriodicElement) => e.category === 'alkali'
  const colorOf = (e: PeriodicElement) => (isAlkali(e) ? 'var(--series-2)' : e.group === accentGroup ? 'var(--series-3)' : 'var(--series-1)')

  const onMove = (ev: PointerEvent<SVGRectElement>) => {
    const r = ev.currentTarget.getBoundingClientRect()
    const z = 1 + ((ev.clientX - r.left) / r.width) * (maxZ - 1)
    setHover(pts.reduce((best, p) => (Math.abs(p.e.z - z) < Math.abs(best.e.z - z) ? p : best)).e)
  }
  const hv = hover ? trendValue(hover.symbol, prop) : undefined

  return (
    <figure className="space-y-2">
      <div className="flex flex-wrap gap-x-4 text-xs text-ink-2">
        <Legend color="var(--series-2)">第 1 族（鹼金屬）</Legend>
        <Legend color="var(--series-3)">{accentGroup === 18 ? '第 18 族（鈍氣）' : '第 17 族（鹵素）'}</Legend>
        <Legend color="var(--series-1)">其他主族元素</Legend>
      </div>
      <div ref={wrap} className="relative overflow-hidden">
        <svg width={width} height={HEIGHT} role="img" aria-label={`${PROPERTY_INFO[prop].nameZh}對原子序的變化圖`}>
          {Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step).map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={PAD.left + plotW} y1={y(t)} y2={y(t)} stroke="var(--line)" />
              <text x={PAD.left - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="var(--ink-2)">
                {fmtValue(prop, t)}
              </text>
            </g>
          ))}
          <text x={PAD.left + plotW} y={HEIGHT - 6} textAnchor="end" fontSize={10} fill="var(--ink-2)">
            原子序 →
          </text>
          {pts.slice(1).map((p, i) => {
            const a = pts[i]
            return (
              <line
                key={p.e.z}
                x1={x(a.e.z)}
                y1={y(a.v)}
                x2={x(p.e.z)}
                y2={y(p.v)}
                stroke="var(--series-1)"
                strokeWidth={p.e.z - a.e.z === 1 ? 2 : 1}
                strokeDasharray={p.e.z - a.e.z === 1 ? undefined : '3 3'}
                opacity={0.6}
              />
            )
          })}
          {pts.map(({ e, v }) => (
            <g key={e.z}>
              <circle cx={x(e.z)} cy={y(v)} r={hover?.z === e.z ? 6 : 4} fill={colorOf(e)} stroke="var(--surface)" strokeWidth={1.5} />
              {(isAlkali(e) || e.group === accentGroup) && (
                <text x={x(e.z)} y={y(v) + (isAlkali(e) ? 14 : -8)} textAnchor="middle" fontSize={9} fill="var(--ink)">
                  {e.symbol}
                </text>
              )}
            </g>
          ))}
          <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} />
        </svg>
        {hover && hv !== undefined && (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-lg"
            style={{ left: Math.min(Math.max(x(hover.z) + 10, 0), width - 150) }}
            role="status"
          >
            {hover.nameZh} {hover.symbol}（{hover.z}）：<span className="font-mono">{fmtValue(prop, hv)}</span> {PROPERTY_INFO[prop].unit}
          </div>
        )}
      </div>
      <figcaption className="text-xs text-ink-2">虛線跨過的是未列入的過渡元素。滑過圖表可查看各元素的數值。</figcaption>
    </figure>
  )
}

function Legend({ color, children }: { color: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  )
}

