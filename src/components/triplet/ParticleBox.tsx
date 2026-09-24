import { seeded } from '../../lib/random'
import { useHighlight } from './highlightContext'

export interface ParticleKind {
  /** 與 Hl 的 k 相同，用來同步高亮 */
  key: string
  label: string
  fill: string
  text: string
  r?: number
}

const COLS = 10
const ROWS = 7
const W = 200
const H = 140

/** 固定的粒子位置（網格＋抖動、固定順序洗牌），粒子增減時既有粒子不會亂跳 */
const SLOTS: [number, number][] = (() => {
  const cells: [number, number][] = []
  for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) cells.push([col, row])
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(i + 1) * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  return cells.map(([c, r], i) => [12 + c * 19.5 + (seeded(i + 500) - 0.5) * 6, 12 + r * 19 + (seeded(i + 900) - 0.5) * 6])
})()

export const PARTICLE_CAPACITY = SLOTS.length

/** 依序放入各種粒子（counts 與 kinds 對應）；高亮某一種時其餘變淡 */
export function ParticleBox({ kinds, counts, label }: { kinds: ParticleKind[]; counts: number[]; label: string }) {
  const { key: highlighted } = useHighlight()
  const particles = kinds.flatMap((k, i) => Array.from({ length: counts[i] ?? 0 }, () => k)).slice(0, PARTICLE_CAPACITY)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label={label}>
      {particles.map((p, i) => {
        const [x, y] = SLOTS[i]
        const r = p.r ?? 7
        const dim = highlighted !== null && highlighted !== p.key
        return (
          <g key={i} opacity={dim ? 0.2 : 1} style={{ transition: 'opacity 0.2s' }}>
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={p.fill}
              stroke={highlighted === p.key ? 'var(--accent)' : 'rgba(0,0,0,0.25)'}
              strokeWidth={highlighted === p.key ? 1.8 : 0.6}
            />
            <text x={x} y={y + 2.3} textAnchor="middle" fontSize={r > 6 ? 6 : 5} fill={p.text} fontWeight={600}>
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
