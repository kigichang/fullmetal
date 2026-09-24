import { SHELL_NAMES, type PeriodicElement } from '../../chem/periodicTable'

const SIZE = 240
const C = SIZE / 2
const NUCLEUS_R = 18
const OUTER_R = 112

/** 波耳模型：原子核在中央，電子依電子層分布在同心圓上 */
export function BohrModel({ element }: { element: PeriodicElement }) {
  const { shells, z } = element
  const gap = (OUTER_R - NUCLEUS_R) / shells.length
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto w-full max-w-60"
      role="img"
      aria-label={`${element.nameZh}的電子排列：${shells.join('、')}`}
    >
      {shells.map((count, i) => {
        const r = NUCLEUS_R + gap * (i + 1)
        const dotR = count > 18 ? 2.2 : count > 8 ? 3 : 4
        return (
          <g key={`${z}-${i}`}>
            <circle cx={C} cy={C} r={r} fill="none" stroke="var(--line)" strokeWidth={1.2} />
            <g
              style={{
                transformOrigin: `${C}px ${C}px`,
                animation: `spin ${24 + i * 10}s linear infinite${i % 2 ? ' reverse' : ''}`,
              }}
            >
              {Array.from({ length: count }, (_, k) => {
                const a = (2 * Math.PI * k) / count - Math.PI / 2
                return <circle key={k} cx={C + r * Math.cos(a)} cy={C + r * Math.sin(a)} r={dotR} fill="var(--accent)" />
              })}
            </g>
            {shells.length <= 5 && (
              <text x={C + r * Math.cos(-Math.PI / 4) + 3} y={C + r * Math.sin(-Math.PI / 4) - 3} fontSize={9} fill="var(--ink-2)">
                {SHELL_NAMES[i]}
              </text>
            )}
          </g>
        )
      })}
      <circle cx={C} cy={C} r={NUCLEUS_R} fill="var(--bad)" opacity={0.85} />
      <text x={C} y={C + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
        {z}+
      </text>
    </svg>
  )
}
