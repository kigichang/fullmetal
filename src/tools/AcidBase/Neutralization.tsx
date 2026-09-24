import { useState, type ReactNode } from 'react'
import {
  acidityLabel,
  indicatorColor,
  neutralizationPh,
  neutralizationTempRise,
  rgbaCss,
  type Indicator,
} from '../../chem/acidBase'
import { fmt } from '../../chem/stoichiometry'
import { Chem } from '../../components/Chem'
import { Card, CardTitle, Chip } from '../../components/ui'

const CONCENTRATIONS = [0.1, 0.5, 1]

export function Neutralization({ indicator }: { indicator: Indicator }) {
  const [cAcid, setCAcid] = useState(0.1)
  const [vAcid, setVAcid] = useState(20)
  const [cBase, setCBase] = useState(0.1)
  const [vBase, setVBase] = useState(0)

  const vEq = (cAcid * vAcid) / cBase
  const vMax = Math.ceil(vEq * 2)
  const v = Math.min(vBase, vMax)
  const pH = neutralizationPh(cAcid, vAcid, cBase, v)
  const dT = neutralizationTempRise(cAcid, vAcid, cBase, v)
  const color = rgbaCss(indicatorColor(pH, indicator))

  const status =
    Math.abs(v - vEq) < 1e-9
      ? '剛好完全中和，溶液只剩食鹽水，呈中性。'
      : v < vEq
        ? `鹽酸還有剩，溶液呈酸性。再加 ${fmt(vEq - v, 2)} mL 就會完全中和。`
        : '氫氧化鈉加過頭了，多出來的 OH⁻ 讓溶液變成鹼性。'

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
      <Card className="space-y-4">
        <CardTitle>實驗設定</CardTitle>
        <Setting label={<>燒杯中 <Chem>HCl</Chem> 濃度</>}>
          {CONCENTRATIONS.map((c) => (
            <Chip key={c} active={c === cAcid} onClick={() => { setCAcid(c); setVBase(0) }}>
              {c} M
            </Chip>
          ))}
        </Setting>
        <label className="block text-sm">
          <span className="flex justify-between">
            <span>
              <Chem>HCl</Chem> 體積
            </span>
            <span className="font-mono">{vAcid} mL</span>
          </span>
          <input type="range" min={10} max={50} step={5} value={vAcid} onChange={(e) => { setVAcid(+e.target.value); setVBase(0) }} />
        </label>
        <Setting label={<>滴定管中 <Chem>NaOH</Chem> 濃度</>}>
          {CONCENTRATIONS.map((c) => (
            <Chip key={c} active={c === cBase} onClick={() => { setCBase(c); setVBase(0) }}>
              {c} M
            </Chip>
          ))}
        </Setting>
        <label className="block rounded-lg bg-surface-2 p-3 text-sm">
          <span className="flex justify-between font-semibold">
            <span>
              滴入 <Chem>NaOH</Chem>
            </span>
            <span className="font-mono text-accent">
              {fmt(v, 1)} / {vMax} mL
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={vMax}
            step={vMax / 200}
            value={v}
            onChange={(e) => {
              const val = +e.target.value
              // 靠近中和點時吸附過去，避免浮點誤差讓學生永遠拉不到 pH 7
              setVBase(Math.abs(val - vEq) < vMax / 400 ? vEq : val)
            }}
            aria-label="滴入氫氧化鈉體積"
          />
          <button type="button" className="mt-1 text-xs text-accent underline underline-offset-4" onClick={() => setVBase(vEq)}>
            跳到完全中和點（{fmt(vEq, 2)} mL）
          </button>
        </label>
      </Card>

      <div className="space-y-4">
        <Card>
          <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
            <Beaker color={color} fill={(vAcid + v) / (vAcid + vMax)} />
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-4xl font-bold tabular-nums">{pH.toFixed(2)}</span>
                <span className="text-sm font-semibold text-ink-2">pH・{acidityLabel(pH)}</span>
              </div>
              <p className="text-sm">{status}</p>
              <p className="text-xs text-ink-2">
                中和放熱：溫度約上升 {dT.toFixed(1)} °C（理想狀況估計）
              </p>
            </div>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardTitle>微觀粒子</CardTitle>
            <IonView ratio={(cBase * v) / (cAcid * vAcid)} />
          </Card>
          <Card>
            <CardTitle>pH 變化曲線</CardTitle>
            <PhCurve cAcid={cAcid} vAcid={vAcid} cBase={cBase} vMax={vMax} vEq={vEq} v={v} pH={pH} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Setting({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="text-sm">
      <div className="mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Beaker({ color, fill }: { color: string; fill: number }) {
  const top = 20
  const bottom = 150
  const liquidTop = bottom - (bottom - top - 10) * fill
  return (
    <svg viewBox="0 0 120 160" className="mx-auto h-40 w-auto" role="img" aria-label="燒杯中的溶液">
      <defs>
        <clipPath id="beaker-clip">
          <path d={`M20 ${top} V${bottom - 8} Q20 ${bottom} 28 ${bottom} H92 Q100 ${bottom} 100 ${bottom - 8} V${top} Z`} />
        </clipPath>
      </defs>
      <rect x={0} y={liquidTop} width={120} height={160} fill={color} clipPath="url(#beaker-clip)" style={{ transition: 'all 0.2s' }} />
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

/** 以 10 個 Cl⁻ 代表原本的鹽酸，依加入的 NaOH 比例畫出 Na⁺、H⁺、OH⁻ 與生成的水分子 */
function IonView({ ratio }: { ratio: number }) {
  const BASE = 10
  const na = Math.min(20, Math.round(BASE * ratio))
  const h = Math.max(0, BASE - na)
  const oh = Math.max(0, na - BASE)
  const water = Math.min(BASE, na)
  const particles: { kind: keyof typeof STYLE }[] = [
    ...Array.from({ length: BASE }, () => ({ kind: 'Cl' as const })),
    ...Array.from({ length: na }, () => ({ kind: 'Na' as const })),
    ...Array.from({ length: h }, () => ({ kind: 'H' as const })),
    ...Array.from({ length: oh }, () => ({ kind: 'OH' as const })),
    ...Array.from({ length: water }, () => ({ kind: 'H2O' as const })),
  ]
  return (
    <div>
      <svg viewBox="0 0 200 140" className="w-full rounded-lg bg-surface-2" role="img" aria-label={`H⁺ ${h} 個、OH⁻ ${oh} 個、水分子 ${water} 個`}>
        {particles.map((p, i) => {
          const [x, y] = SLOTS[i % SLOTS.length]
          const s = STYLE[p.kind]
          return (
            <g key={i} style={{ transition: 'opacity 0.3s' }}>
              <circle cx={x} cy={y} r={s.r} fill={s.fill} stroke="rgba(0,0,0,0.25)" strokeWidth={0.6} />
              <text x={x} y={y + 2.5} textAnchor="middle" fontSize={s.r > 6 ? 6.5 : 5.5} fill={s.text} fontWeight={600}>
                {s.label}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-2">
        <span>
          <Chem>H^+</Chem> × {h}
        </span>
        <span>
          <Chem>OH^-</Chem> × {oh}
        </span>
        <span>
          <Chem>H2O</Chem> × {water}
        </span>
        <span>
          <Chem>Na^+</Chem>、<Chem>Cl^-</Chem> 為旁觀離子
        </span>
      </div>
    </div>
  )
}

const STYLE = {
  Cl: { r: 7, fill: '#22c55e', text: '#052e16', label: 'Cl⁻' },
  Na: { r: 7, fill: '#a78bfa', text: '#2e1065', label: 'Na⁺' },
  H: { r: 7, fill: '#f87171', text: '#450a0a', label: 'H⁺' },
  OH: { r: 7, fill: '#60a5fa', text: '#172554', label: 'OH⁻' },
  H2O: { r: 6, fill: '#e2e8f0', text: '#334155', label: 'H₂O' },
}

/** 固定的粒子位置（網格加抖動），讓滑桿移動時既有粒子不會亂跳 */
const SLOTS: [number, number][] = (() => {
  const cells: [number, number][] = []
  for (let row = 0; row < 7; row++) for (let col = 0; col < 10; col++) cells.push([col, row])
  const rand = (i: number) => {
    const x = Math.sin(i * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  // 固定順序洗牌
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand(i + 1) * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  return cells.map(([c, r], i) => [12 + c * 19.5 + (rand(i + 500) - 0.5) * 6, 12 + r * 19 + (rand(i + 900) - 0.5) * 6])
})()

function PhCurve({
  cAcid,
  vAcid,
  cBase,
  vMax,
  vEq,
  v,
  pH,
}: {
  cAcid: number
  vAcid: number
  cBase: number
  vMax: number
  vEq: number
  v: number
  pH: number
}) {
  const W = 240
  const H = 160
  const pad = { l: 26, r: 8, t: 8, b: 22 }
  const x = (vol: number) => pad.l + (vol / vMax) * (W - pad.l - pad.r)
  const y = (p: number) => pad.t + (1 - p / 14) * (H - pad.t - pad.b)
  const N = 240
  const d = Array.from({ length: N + 1 }, (_, i) => {
    const vol = (i / N) * vMax
    return `${i === 0 ? 'M' : 'L'}${x(vol).toFixed(1)} ${y(neutralizationPh(cAcid, vAcid, cBase, vol)).toFixed(1)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`pH 曲線，目前 pH ${pH.toFixed(2)}`}>
      {[0, 7, 14].map((p) => (
        <g key={p}>
          <line x1={pad.l} x2={W - pad.r} y1={y(p)} y2={y(p)} stroke="var(--line)" strokeDasharray={p === 7 ? '3 3' : undefined} />
          <text x={pad.l - 4} y={y(p) + 3} textAnchor="end" fontSize={9} fill="var(--ink-2)">
            {p}
          </text>
        </g>
      ))}
      <line x1={x(vEq)} x2={x(vEq)} y1={pad.t} y2={H - pad.b} stroke="var(--warn)" strokeDasharray="3 3" />
      <text x={x(vEq)} y={H - 8} textAnchor="middle" fontSize={9} fill="var(--warn)">
        中和點
      </text>
      <text x={W - pad.r} y={H - 8} textAnchor="end" fontSize={9} fill="var(--ink-2)">
        {vMax} mL
      </text>
      <text x={pad.l} y={H - 8} fontSize={9} fill="var(--ink-2)">
        0
      </text>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={x(v)} cy={y(pH)} r={4.5} fill="var(--bad)" stroke="var(--surface)" strokeWidth={1.5} />
    </svg>
  )
}
