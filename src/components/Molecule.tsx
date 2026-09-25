import { getElement } from '../chem/elements'
import { parseFormula } from '../chem/formula'

const BASE_R = 11
const PER_ROW = 6

/** 以彩色小球畫出一個分子：非氫原子在前、氫原子在後，每列最多 6 顆，彼此略為重疊 */
export function Molecule({ formula, scale = 1, focus = null }: { formula: string; scale?: number; /** 只強調這個元素，其他原子變淡 */ focus?: string | null }) {
  const counts = parseFormula(formula)
  const atoms = Object.entries(counts)
    .sort(([a], [b]) => (a === 'H' ? 1 : 0) - (b === 'H' ? 1 : 0))
    .flatMap(([el, n]) => Array<string>(n).fill(el))

  const r = BASE_R * scale
  const step = r * 1.45
  const rows = Math.ceil(atoms.length / PER_ROW)
  const cols = Math.min(atoms.length, PER_ROW)
  const maxR = Math.max(...atoms.map((a) => getElement(a).radius)) * r
  const width = (cols - 1) * step + maxR * 2 + 2
  const height = (rows - 1) * step + maxR * 2 + 2

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={formula}>
      {atoms.map((el, i) => {
        const e = getElement(el)
        const row = Math.floor(i / PER_ROW)
        const col = i % PER_ROW
        const rr = e.radius * r
        const cx = maxR + 1 + col * step
        const cy = maxR + 1 + row * step
        return (
          <g key={i} opacity={focus && focus !== el ? 0.15 : 1} style={{ transition: 'opacity 0.2s' }}>
            <circle
              cx={cx}
              cy={cy}
              r={rr}
              fill={e.color}
              stroke={focus === el ? 'var(--accent)' : 'rgba(0,0,0,0.35)'}
              strokeWidth={focus === el ? 2 : 0.8}
            />
            <circle cx={cx - rr * 0.35} cy={cy - rr * 0.35} r={rr * 0.3} fill="rgba(255,255,255,0.35)" />
          </g>
        )
      })}
    </svg>
  )
}

/** 圖例：列出分子中出現的元素顏色 */
export function AtomLegend({ elements }: { elements: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-2">
      {elements.map((el) => {
        const e = getElement(el)
        return (
          <span key={el} className="inline-flex items-center gap-1">
            <span className="inline-block size-3 rounded-full border border-black/30" style={{ background: e.color }} />
            {e.symbol} {e.nameZh}
          </span>
        )
      })}
    </div>
  )
}
