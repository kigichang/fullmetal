import { useState, type CSSProperties } from 'react'
import { ELEMENTS } from '../../chem/elements'
import {
  CATEGORY_LABEL,
  gridPosition,
  METAL_LABEL,
  metalClass,
  PERIODIC_TABLE,
  SHELL_NAMES,
  STATE_LABEL,
  type Category,
  type MetalClass,
  type PeriodicElement,
  type State,
} from '../../chem/periodicTable'
import { Card, Chip, Segmented } from '../../components/ui'
import { Link } from 'react-router-dom'
import { BohrModel } from './BohrModel'

type ColorMode = 'category' | 'metal' | 'state'

const CATEGORY_COLOR: Record<Category, string> = {
  alkali: '#ef4444',
  alkaline: '#f97316',
  transition: '#eab308',
  'post-transition': '#22c55e',
  metalloid: '#14b8a6',
  nonmetal: '#3b82f6',
  halogen: '#8b5cf6',
  noble: '#ec4899',
  lanthanide: '#84cc16',
  actinide: '#d946ef',
  unknown: '',
}

const METAL_COLOR: Record<MetalClass, string> = {
  metal: '#eab308',
  metalloid: '#14b8a6',
  nonmetal: '#3b82f6',
  unknown: '',
}

const STATE_COLOR: Record<State, string> = {
  solid: '#78716c',
  liquid: '#0ea5e9',
  gas: '#ec4899',
  unknown: '',
}

/** 依目前的著色模式回傳：分類鍵、顏色、標籤 */
function colorKey(el: PeriodicElement, mode: ColorMode): { key: string; color: string } {
  if (mode === 'metal') {
    const k = metalClass(el.category)
    return { key: k, color: METAL_COLOR[k] }
  }
  if (mode === 'state') return { key: el.state, color: STATE_COLOR[el.state] }
  return { key: el.category, color: CATEGORY_COLOR[el.category] }
}

function legendFor(mode: ColorMode): { key: string; label: string; color: string }[] {
  if (mode === 'metal')
    return (Object.keys(METAL_LABEL) as MetalClass[]).map((k) => ({ key: k, label: METAL_LABEL[k], color: METAL_COLOR[k] }))
  if (mode === 'state')
    return (Object.keys(STATE_LABEL) as State[]).map((k) => ({ key: k, label: STATE_LABEL[k], color: STATE_COLOR[k] }))
  return (Object.keys(CATEGORY_LABEL) as Category[]).map((k) => ({ key: k, label: CATEGORY_LABEL[k], color: CATEGORY_COLOR[k] }))
}

const tint = (color: string, pct: number) => (color ? `color-mix(in oklab, ${color} ${pct}%, var(--surface))` : 'transparent')

function matchesQuery(el: PeriodicElement, q: string): boolean {
  const s = q.trim().toLowerCase()
  if (!s) return true
  if (/^\d+$/.test(s)) return el.z === parseInt(s, 10)
  return el.symbol.toLowerCase() === s || el.nameZh.includes(q.trim()) || el.nameEn.toLowerCase().startsWith(s)
}

const formatMass = (el: PeriodicElement) => (el.massIsMassNumber ? `[${el.mass}]` : String(el.mass))

/** 查詢：118 個元素的互動週期表 */
export function TableExplorer() {
  const [mode, setMode] = useState<ColorMode>('category')
  const [juniorOnly, setJuniorOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [legendFilter, setLegendFilter] = useState<string | null>(null)
  const [selected, setSelected] = useState<PeriodicElement>(PERIODIC_TABLE[5])
  const [hovered, setHovered] = useState<PeriodicElement | null>(null)

  const isActive = (el: PeriodicElement) =>
    matchesQuery(el, query) && (!juniorOnly || el.juniorHigh) && (!legendFilter || colorKey(el, mode).key === legendFilter)

  const changeMode = (m: ColorMode) => {
    setMode(m)
    setLegendFilter(null)
  }

  const preview = hovered ?? selected

  return (
    <>
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented<ColorMode>
            value={mode}
            onChange={changeMode}
            options={[
              { value: 'category', label: '元素分類' },
              { value: 'metal', label: '金屬／非金屬' },
              { value: 'state', label: '常溫狀態' },
            ]}
          />
          <Chip active={juniorOnly} onClick={() => setJuniorOnly((v) => !v)} title="前 20 號元素與國中常見元素">
            只看國中重點
          </Chip>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋：Na、鈉、sodium、11"
            aria-label="搜尋元素"
            className="min-w-0 flex-1 basis-48 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm"
          />
        </div>
        <Legend mode={mode} active={legendFilter} onToggle={(k) => setLegendFilter((cur) => (cur === k ? null : k))} />
      </Card>

      <Card className="p-2 sm:p-3">
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[46rem] gap-0.5 sm:gap-1"
            style={{ gridTemplateColumns: '1.1rem repeat(18, minmax(0, 1fr))' }}
            onMouseLeave={() => setHovered(null)}
          >
            {Array.from({ length: 18 }, (_, i) => (
              <div key={`g${i}`} className="text-center text-[10px] text-ink-2" style={{ gridRow: 1, gridColumn: i + 2 }}>
                {i + 1}
              </div>
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={`p${i}`}
                className="flex items-center justify-center text-[10px] text-ink-2"
                style={{ gridRow: i + 2, gridColumn: 1 }}
              >
                {i + 1}
              </div>
            ))}

            <Inset element={preview} />

            <Placeholder row={6} label="57–71" sub="鑭系" />
            <Placeholder row={7} label="89–103" sub="錒系" />
            <div style={{ gridRow: 9, gridColumn: '1 / -1' }} className="h-2" />

            {PERIODIC_TABLE.map((el) => {
              const { row, col } = gridPosition(el)
              return (
                <ElementCell
                  key={el.z}
                  element={el}
                  color={colorKey(el, mode).color}
                  active={isActive(el)}
                  selected={selected.z === el.z}
                  style={{ gridRow: row + 1, gridColumn: col + 1 }}
                  onSelect={() => setSelected(el)}
                  onHover={() => setHovered(el)}
                />
              )
            })}
          </div>
        </div>
      </Card>

      <ElementDetail element={selected} />
    </>
  )
}

function Legend({ mode, active, onToggle }: { mode: ColorMode; active: string | null; onToggle: (k: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 text-xs">
      {legendFor(mode).map((item) => (
        <button
          key={item.key}
          type="button"
          aria-pressed={active === item.key}
          onClick={() => onToggle(item.key)}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition ${
            active === item.key ? 'border-accent ring-1 ring-accent' : 'border-line hover:bg-surface-2'
          } ${active && active !== item.key ? 'opacity-50' : ''}`}
        >
          <span
            className={`size-3 rounded-sm border ${item.color ? 'border-black/20' : 'border-dashed border-ink-2'}`}
            style={{ background: item.color || 'transparent' }}
          />
          {item.label}
        </button>
      ))}
      {active && <span className="self-center text-ink-2">再點一次取消篩選</span>}
    </div>
  )
}

function ElementCell({
  element: el,
  color,
  active,
  selected,
  style,
  onSelect,
  onHover,
}: {
  element: PeriodicElement
  color: string
  active: boolean
  selected: boolean
  style: CSSProperties
  onSelect: () => void
  onHover: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onHover}
      aria-label={`${el.z} ${el.nameZh} ${el.symbol}`}
      aria-pressed={selected}
      className={`relative flex aspect-[4/5] min-h-11 flex-col items-center justify-center rounded-md border leading-none transition ${
        color ? '' : 'border-dashed'
      } ${active ? '' : 'opacity-20'} ${selected ? 'z-[2] ring-2 ring-accent' : 'hover:z-[3] hover:scale-110'}`}
      style={{ ...style, background: tint(color, 32), borderColor: color ? tint(color, 70) : 'var(--line)' }}
    >
      <span className="absolute top-0.5 left-1 text-[9px] text-ink-2">{el.z}</span>
      <span className="mt-1.5 text-sm font-bold sm:text-base">{el.symbol}</span>
      <span className="mt-0.5 text-[10px] text-ink-2">{el.nameZh}</span>
    </button>
  )
}

function Placeholder({ row, label, sub }: { row: number; label: string; sub: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-md border border-dashed border-line text-[9px] leading-tight text-ink-2"
      style={{ gridRow: row + 1, gridColumn: 4 }}
    >
      <span>{label}</span>
      <span>{sub}</span>
    </div>
  )
}

/** 放在週期表上方空白處（第 1–3 週期、第 3–12 族）的快速預覽 */
function Inset({ element: el }: { element: PeriodicElement }) {
  return (
    <div
      className="flex items-center gap-4 self-center px-3"
      style={{ gridRow: '2 / span 3', gridColumn: '5 / span 9' }}
      aria-live="polite"
    >
      <div className="text-center">
        <div className="text-xs text-ink-2">{el.z}</div>
        <div className="text-4xl font-bold">{el.symbol}</div>
      </div>
      <div className="min-w-0 space-y-0.5 text-sm">
        <div className="font-semibold">
          {el.nameZh} <span className="font-normal text-ink-2">{el.nameEn}</span>
        </div>
        <div className="text-ink-2">原子量 {formatMass(el)}</div>
        <div className="text-ink-2">電子排列 {el.shells.join(', ')}</div>
      </div>
    </div>
  )
}

function ElementDetail({ element: el }: { element: PeriodicElement }) {
  const textbook = ELEMENTS[el.symbol]
  const facts: [string, string][] = [
    ['原子序', `${el.z}（原子核內有 ${el.z} 個質子）`],
    ['原子量', formatMass(el) + (el.massIsMassNumber ? '（最穩定同位素的質量數）' : '')],
    ...(textbook && textbook.mass !== el.mass ? [['課本計算常用', String(textbook.mass)] as [string, string]] : []),
    ['位置', el.group ? `第 ${el.period} 週期、第 ${el.group} 族` : `第 ${el.period} 週期、${CATEGORY_LABEL[el.category]}`],
    ['分類', `${CATEGORY_LABEL[el.category]}（${METAL_LABEL[metalClass(el.category)]}）`],
    ['常溫狀態', STATE_LABEL[el.state]],
    ['電子排列', el.shells.map((n, i) => `${SHELL_NAMES[i]}${n}`).join('、')],
    ['最外層電子', `${el.shells.at(-1)} 個`],
    ['電子組態（高中）', el.configuration],
  ]
  return (
    <Card>
      <div className="grid gap-6 md:grid-cols-[15rem_1fr]">
        <div>
          <BohrModel element={el} />
          <p className="mt-1 text-center text-xs text-ink-2">國中使用的波耳模型（示意，未依比例）</p>
          {el.z <= 36 && (
            <Link to={`/periodic-table?tab=orbitals&level=senior&z=${el.z}`} className="mt-1 block text-center text-xs text-accent underline underline-offset-4">
              高中：看它的軌域方格圖 →
            </Link>
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 className="text-2xl font-bold">
              {el.nameZh} <span className="font-mono">{el.symbol}</span>
            </h2>
            <span className="text-ink-2">{el.nameEn}</span>
            {el.juniorHigh && <span className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent">國中重點</span>}
          </div>
          <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]">
            {facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink-2">{k}</dt>
                <dd className={k.startsWith('電子組態') ? 'font-mono' : ''}>{k.startsWith('電子組態') ? <Config text={v} /> : v}</dd>
              </div>
            ))}
          </dl>
          {el.note && <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-sm">{el.note}</p>}
        </div>
      </div>
    </Card>
  )
}

/** 把 "3d6" 的電子數顯示成上標 */
function Config({ text }: { text: string }) {
  return (
    <>
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
    </>
  )
}

