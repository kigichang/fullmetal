import { ionChem, particleScene, type PrecipitationResult } from '../../chem/precipitation'
import { useHighlight } from '../../components/triplet/highlightContext'
import { chemUnicode } from '../../lib/format'
import { seeded } from '../../lib/random'

export type MixPhase = 'apart' | 'mixed' | 'formed'

const W = 240
const H = 170
const R = 8.5

interface Particle {
  key: string
  label: string
  fill: string
  text: string
  apart: [number, number]
  mixed: [number, number]
  formed: [number, number]
}

/** 粒子層的沉澱反應：兩杯溶液的離子 → 混合 → 結合成沉澱沉到底部，旁觀離子留在溶液中 */
export function IonMixing({ result, phase }: { result: PrecipitationResult; phase: MixPhase }) {
  const scene = particleScene(result)
  const { key: highlighted } = useHighlight()
  const catKey = ionChem(result.cation)
  const anKey = ionChem(result.anion)

  // 固體：每份 = cationCount 個陽離子 + anionCount 個陰離子，在底部排成晶格
  const perUnit = scene.cationCount + scene.anionCount
  const solidTotal = scene.solidUnits * perUnit
  const latticeCols = Math.min(solidTotal, 12)
  const lattice = (i: number): [number, number] => {
    const row = Math.floor(i / latticeCols)
    const col = i % latticeCols
    const x0 = W / 2 - ((latticeCols - 1) * R * 1.9) / 2
    return [x0 + col * R * 1.9, H - 12 - row * R * 1.8]
  }

  // 在區域內切成格子、固定順序洗牌後依序取用，粒子不會互相重疊
  const makeSlots = (x0: number, x1: number, y0: number, y1: number, seed: number) => {
    const gap = R * 2.3
    const cols = Math.max(1, Math.floor((x1 - x0) / gap))
    const rows = Math.max(1, Math.floor((y1 - y0) / gap))
    const cells: [number, number][] = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r])
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(seeded(seed + i) * (i + 1))
      ;[cells[i], cells[j]] = [cells[j], cells[i]]
    }
    const cw = (x1 - x0) / cols
    const rh = (y1 - y0) / rows
    let next = 0
    return (): [number, number] => {
      const [c, r] = cells[next++ % cells.length]
      return [x0 + (c + 0.5) * cw + (seeded(seed + 500 + next) - 0.5) * (cw - 2 * R) * 0.6, y0 + (r + 0.5) * rh + (seeded(seed + 900 + next) - 0.5) * (rh - 2 * R) * 0.6]
    }
  }
  const latticeRows = Math.ceil(solidTotal / Math.max(1, latticeCols))
  const leftSlot = makeSlots(4, W / 2 - 4, 4, H - 4, 11)
  const rightSlot = makeSlots(W / 2 + 4, W - 4, 4, H - 4, 23)
  const mixedSlot = makeSlots(4, W - 4, 4, H - 4, 37)
  const upperSlot = makeSlots(4, W - 4, 4, H - 20 - latticeRows * R * 1.8, 53)

  const particles: Particle[] = []
  let solidIdx = 0
  const push = (kind: 'cat' | 'an' | 'no3' | 'na', count: number, solidCount: number) => {
    for (let i = 0; i < count; i++) {
      const left = kind === 'cat' || kind === 'no3'
      const inSolid = i < solidCount
      const style = {
        cat: { key: catKey, label: chemUnicode(catKey), fill: 'var(--series-1)', text: '#fff' },
        an: { key: anKey, label: chemUnicode(anKey), fill: 'var(--series-2)', text: '#fff' },
        no3: { key: 'NO3^-', label: 'NO₃⁻', fill: '#cbd5e1', text: '#1e293b' },
        na: { key: 'Na^+', label: 'Na⁺', fill: '#e2e8f0', text: '#1e293b' },
      }[kind]
      const mixed = mixedSlot()
      particles.push({
        ...style,
        apart: left ? leftSlot() : rightSlot(),
        mixed,
        formed: inSolid ? lattice(solidIdx++) : upperSlot(),
      })
    }
  }
  // 交錯放入陽、陰離子，讓晶格中兩種離子相鄰
  for (let u = 0; u < scene.portions; u++) {
    const solid = u < scene.solidUnits
    push('cat', scene.cationCount, solid ? scene.cationCount : 0)
    push('an', scene.anionCount, solid ? scene.anionCount : 0)
  }
  push('no3', scene.nitrates, 0)
  push('na', scene.sodiums, 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-surface-2" role="img" aria-label={describe(result, phase, scene.solidUnits)}>
      {phase === 'apart' && <line x1={W / 2} x2={W / 2} y1={6} y2={H - 6} stroke="var(--ink-2)" strokeDasharray="4 3" />}
      {phase === 'formed' && scene.solidUnits > 0 && (
        <rect x={6} y={H - 14 - Math.ceil(solidTotal / latticeCols) * R * 1.8} width={W - 12} height={Math.ceil(solidTotal / latticeCols) * R * 1.8 + 10} rx={6} fill={result.color} opacity={0.35} />
      )}
      {particles.map((p, i) => {
        const [x, y] = p[phase]
        const dim = highlighted !== null && highlighted !== p.key
        return (
          <g key={i} style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.9s ease-in-out, opacity 0.2s' }} opacity={dim ? 0.2 : 1}>
            <circle r={R} fill={p.fill} stroke={highlighted === p.key ? 'var(--accent)' : 'rgba(0,0,0,0.25)'} strokeWidth={highlighted === p.key ? 1.8 : 0.6} />
            <text y={2.2} textAnchor="middle" fontSize={p.label.length > 3 ? 4.8 : 6} fontWeight={600} fill={p.text}>
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function describe(r: PrecipitationResult, phase: MixPhase, solid: number): string {
  if (phase === 'apart') return '兩杯溶液的離子分別在左右兩邊'
  if (phase === 'mixed') return '兩杯溶液混合，離子散布在水中'
  return solid > 0 ? `${chemUnicode(ionChem(r.cation))} 與 ${chemUnicode(ionChem(r.anion))} 結合成沉澱沉到底部，旁觀離子留在溶液中` : '沒有離子結合成沉澱，全部散布在水中'
}
