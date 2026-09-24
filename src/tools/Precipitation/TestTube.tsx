import type { PrecipitationResult } from '../../chem/precipitation'

const W = 120
const H = 240
const TUBE_L = 35
const TUBE_R = 85
const TUBE_BOTTOM = 220
const LIQUID_TOP = 90
const CLEAR = 'rgba(186, 230, 253, 0.28)'

/** 簡單的偽亂數，讓沉澱粒子位置固定但看起來自然 */
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function TestTube({ result }: { result: PrecipitationResult }) {
  const { outcome } = result
  const hasSolid = outcome !== 'soluble' && !!result.color
  const liquid =
    result.solutionColor ?? (outcome === 'soluble' ? (result.cation.solutionColor ?? CLEAR) : CLEAR)
  const gas = result.netIonic?.includes('↑') ?? false
  const particleCount = hasSolid ? (outcome === 'slight' ? 7 : 18) : 0
  const layer = hasSolid ? (outcome === 'slight' ? 8 : 20) : 0
  const key = `${result.cation.id}|${result.anion.id}`
  const tubePath = `M${TUBE_L} 20 V${TUBE_BOTTOM - 25} A25 25 0 0 0 ${TUBE_R} ${TUBE_BOTTOM - 25} V20`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-56 w-auto"
      role="img"
      aria-label={hasSolid ? `試管底部出現${result.colorName}沉澱` : '試管中沒有沉澱'}
    >
      <defs>
        <clipPath id="tube-clip">
          <path d={`${tubePath} Z`} />
        </clipPath>
      </defs>
      <g clipPath="url(#tube-clip)" key={key}>
        <rect x={0} y={LIQUID_TOP} width={W} height={H} fill={liquid} style={{ transition: 'fill 0.4s' }} />
        {hasSolid && (
          <rect
            x={0}
            y={TUBE_BOTTOM - layer}
            width={W}
            height={layer}
            fill={result.color}
            opacity={outcome === 'slight' ? 0.6 : 1}
            style={{ animation: 'fade-in 1.2s ease-in 0.9s both' }}
          />
        )}
        {Array.from({ length: particleCount }, (_, i) => {
          const x = TUBE_L + 6 + seeded(i + 1) * (TUBE_R - TUBE_L - 12)
          const y = TUBE_BOTTOM - layer - 3 - seeded(i + 50) * 10
          const from = -(40 + seeded(i + 99) * 70)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2.6}
              fill={result.color}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={0.5}
              style={{ ['--from-y' as string]: `${from}px`, animation: `settle 1.4s ease-in ${seeded(i + 7) * 0.5}s both` }}
            />
          )
        })}
        {gas &&
          Array.from({ length: 8 }, (_, i) => (
            <circle
              key={`g${i}`}
              cx={TUBE_L + 8 + seeded(i + 200) * (TUBE_R - TUBE_L - 16)}
              cy={TUBE_BOTTOM - 20}
              r={2 + seeded(i + 300) * 2}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.6}
              style={{ animation: `rise 1.8s ease-in ${seeded(i + 400) * 1.8}s infinite` }}
            />
          ))}
      </g>
      <path d={tubePath} fill="none" stroke="var(--glass)" strokeWidth={3} />
      <path d={`M${TUBE_L - 6} 20 H${TUBE_R + 6}`} stroke="var(--glass)" strokeWidth={4} strokeLinecap="round" />
    </svg>
  )
}
