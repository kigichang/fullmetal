import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { chemUnicode } from '../lib/format'
import { Chem } from './Chem'
import { useHighlight } from './triplet/highlightContext'
import { niceStep } from '../lib/scale'

export interface TimeSeries {
  /** 與三表徵高亮共用的 key（化學式） */
  key: string
  /** Chem 字串 */
  label: string
  /** CSS 顏色（使用 --series-n） */
  color: string
  values: number[]
}

export interface TimeMarker {
  x: number
  label: string
}

const PAD = { top: 22, right: 64, bottom: 28, left: 52 }


/**
 * 時間序列折線圖：2px 線、直接標籤、圖例、十字線＋提示框、數據表。
 * 滑過三表徵中的物種時，其他線條會變淡。
 */
export function TimeChart({
  series,
  markers = [],
  yLabel,
  xLabel,
  format = (v) => v.toPrecision(3),
  height = 240,
  caption,
}: {
  series: TimeSeries[]
  markers?: TimeMarker[]
  yLabel: string
  xLabel: string
  format?: (v: number) => string
  height?: number
  caption: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)
  const [hover, setHover] = useState<number | null>(null)
  const { key: highlighted } = useHighlight()

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    // 先同步量一次，避免第一次渲染用預設寬度撐破手機版面
    setWidth(Math.max(280, el.clientWidth))
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const n = Math.max(1, ...series.map((s) => s.values.length))
  const dataMax = Math.max(0, ...series.flatMap((s) => s.values)) || 1
  const step = niceStep(dataMax)
  const yMax = Math.ceil((dataMax * 1.02) / step) * step
  const plotW = width - PAD.left - PAD.right
  const plotH = height - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * plotW)
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step)

  // 線尾的直接標籤：依 y 排序後互相推開，避免重疊
  const ends = series
    .map((s) => ({ s, y: y(s.values.at(-1) ?? 0) }))
    .sort((a, b) => a.y - b.y)
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 13) ends[i].y = ends[i - 1].y + 13

  const pick = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = (e.clientX - rect.left) / rect.width
    setHover(Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1)))))
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setHover((h) => Math.min(n - 1, (h ?? -1) + 1))
    else if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? n) - 1))
    else if (e.key === 'Escape') setHover(null)
  }

  const tipLeft = hover === null ? 0 : Math.min(Math.max(x(hover) + 12, 0), width - 170)

  return (
    <figure className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2" aria-hidden>
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ background: s.color }} />
            <Chem>{s.label}</Chem>
          </span>
        ))}
      </div>
      <div ref={wrap} className="relative overflow-hidden">
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={caption}
          tabIndex={0}
          onKeyDown={onKey}
          className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={PAD.left + plotW} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
              <text x={PAD.left - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="var(--ink-2)">
                {format(t)}
              </text>
            </g>
          ))}
          <text x={PAD.left} y={12} fontSize={10} fill="var(--ink-2)">
            {yLabel}
          </text>
          <text x={PAD.left + plotW} y={height - 6} textAnchor="end" fontSize={10} fill="var(--ink-2)">
            {xLabel} →
          </text>

          {markers.map((m, i) => (
            <g key={i}>
              <line x1={x(m.x)} x2={x(m.x)} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--ink-2)" strokeDasharray="3 3" opacity={0.6} />
              <text x={x(m.x) + 3} y={PAD.top + 10 + (i % 3) * 12} fontSize={10} fill="var(--ink-2)">
                {m.label}
              </text>
            </g>
          ))}

          {series.map((s) => (
            <path
              key={s.key}
              d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={highlighted && highlighted !== s.key ? 0.2 : 1}
              style={{ transition: 'opacity 0.2s' }}
            />
          ))}

          {ends.map(({ s, y: ly }) => (
            <g key={s.key} opacity={highlighted && highlighted !== s.key ? 0.3 : 1}>
              <circle cx={x(s.values.length - 1)} cy={y(s.values.at(-1) ?? 0)} r={3} fill={s.color} />
              <text x={PAD.left + plotW + 8} y={ly + 3.5} fontSize={11} fontWeight={600} fill="var(--ink)">
                {chemUnicode(s.label)}
              </text>
            </g>
          ))}

          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--ink-2)" strokeWidth={1} />
              {series.map((s) => (
                <circle key={s.key} cx={x(hover)} cy={y(s.values[hover] ?? 0)} r={4.5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
              ))}
            </g>
          )}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={pick}
            onPointerDown={pick}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-6 z-10 w-40 rounded-lg border border-line bg-surface px-2.5 py-2 text-xs shadow-lg"
            style={{ left: tipLeft }}
            role="status"
          >
            <div className="mb-1 text-ink-2">
              {xLabel} {hover}
            </div>
            {series.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block size-2 rounded-full" style={{ background: s.color }} />
                  <Chem>{s.label}</Chem>
                </span>
                <span className="font-mono tabular-nums text-ink">{format(s.values[hover] ?? 0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <figcaption className="text-xs text-ink-2">{caption}</figcaption>
      <details className="text-xs">
        <summary className="cursor-pointer text-ink-2">數據表</summary>
        <div className="mt-2 max-h-48 overflow-auto">
          <table className="w-full text-right font-mono tabular-nums">
            <thead className="sticky top-0 bg-surface">
              <tr>
                <th className="py-1 text-left font-sans font-medium text-ink-2">{xLabel}</th>
                {series.map((s) => (
                  <th key={s.key} className="px-2 py-1 font-sans font-medium">
                    <Chem>{s.label}</Chem>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: n }, (_, i) => i)
                .filter((i) => i % Math.max(1, Math.ceil(n / 40)) === 0 || i === n - 1)
                .map((i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="py-0.5 text-left">{i}</td>
                    {series.map((s) => (
                      <td key={s.key} className="px-2 py-0.5">
                        {format(s.values[i] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
