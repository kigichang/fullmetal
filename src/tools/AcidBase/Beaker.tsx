import { useId } from 'react'

/** 燒杯：液面高度 fill（0–1）與溶液顏色 */
export function Beaker({ color, fill, label = '燒杯中的溶液' }: { color: string; fill: number; label?: string }) {
  const clipId = useId()
  const top = 20
  const bottom = 150
  const liquidTop = bottom - (bottom - top - 10) * fill
  return (
    <svg viewBox="0 0 120 160" className="mx-auto h-40 w-auto" role="img" aria-label={label}>
      <defs>
        <clipPath id={clipId}>
          <path d={`M20 ${top} V${bottom - 8} Q20 ${bottom} 28 ${bottom} H92 Q100 ${bottom} 100 ${bottom - 8} V${top} Z`} />
        </clipPath>
      </defs>
      <rect x={0} y={liquidTop} width={120} height={160} fill={color} clipPath={`url(#${clipId})`} style={{ transition: 'all 0.2s' }} />
      <path
        d={`M14 ${top - 4} Q20 ${top - 2} 20 ${top + 4} V${bottom - 8} Q20 ${bottom} 28 ${bottom} H92 Q100 ${bottom} 100 ${bottom - 8} V${top}`}
        fill="none"
        stroke="var(--glass)"
        strokeWidth={3}
      />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={88} x2={100} y1={bottom - (bottom - top) * f} y2={bottom - (bottom - top) * f} stroke="var(--glass)" strokeWidth={1.5} />
      ))}
    </svg>
  )
}
