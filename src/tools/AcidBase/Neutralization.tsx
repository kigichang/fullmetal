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
import { Hl } from '../../components/triplet/Highlight'
import { ParticleBox, type ParticleKind } from '../../components/triplet/ParticleBox'
import { TripletLayout } from '../../components/triplet/TripletLayout'
import { Card, CardTitle, Chip } from '../../components/ui'
import { Beaker } from './Beaker'

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

  const ratio = (cBase * v) / (cAcid * vAcid)
  // 以 10 個 Cl⁻ 代表原本的鹽酸，依加入的 NaOH 比例換算其他粒子個數
  const BASE = 10
  const na = Math.min(20, Math.round(BASE * ratio))
  const ions = { h: Math.max(0, BASE - na), oh: Math.max(0, na - BASE), water: Math.min(BASE, na), na }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>實驗設定</CardTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
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
          </div>
          <label className="block self-start rounded-lg bg-surface-2 p-3 text-sm">
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
            <p className="mt-2 text-sm">{status}</p>
          </label>
        </div>
      </Card>

      <TripletLayout
        macro={
          <div className="space-y-3">
            <Beaker color={color} fill={(vAcid + v) / (vAcid + vMax)} />
            <div className="flex items-baseline justify-center gap-3">
              <span className="font-mono text-4xl font-bold tabular-nums">{pH.toFixed(2)}</span>
              <span className="text-sm font-semibold text-ink-2">pH・{acidityLabel(pH)}</span>
            </div>
            <p className="text-center text-xs text-ink-2">中和放熱：溫度約上升 {dT.toFixed(1)} °C（理想狀況估計）</p>
          </div>
        }
        micro={
          <div className="space-y-2">
            <ParticleBox
              kinds={ION_KINDS}
              counts={[BASE, ions.na, ions.h, ions.oh, ions.water]}
              label={`H⁺ ${ions.h} 個、OH⁻ ${ions.oh} 個、水分子 ${ions.water} 個`}
            />
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <Hl k="H">
                <Chem>H^+</Chem> × {ions.h}
              </Hl>
              <Hl k="OH">
                <Chem>OH^-</Chem> × {ions.oh}
              </Hl>
              <Hl k="H2O">
                <Chem>H2O</Chem> × {ions.water}
              </Hl>
              <Hl k="Na">
                <Chem>Na^+</Chem> × {ions.na}
              </Hl>
              <Hl k="Cl">
                <Chem>Cl^-</Chem> × {BASE}
              </Hl>
            </div>
            <p className="text-xs text-ink-2">
              <Chem>Na^+</Chem>、<Chem>Cl^-</Chem> 是旁觀離子，中和後仍留在溶液中。
            </p>
          </div>
        }
        symbolic={
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-surface-2 px-2 py-2 text-center">
              <Hl k="Cl">
                <Chem>HCl</Chem>
              </Hl>{' '}
              +{' '}
              <Hl k="Na">
                <Chem>NaOH</Chem>
              </Hl>{' '}
              →{' '}
              <Hl k="Na">
                <Chem>NaCl</Chem>
              </Hl>{' '}
              +{' '}
              <Hl k="H2O">
                <Chem>H2O</Chem>
              </Hl>
            </div>
            <div className="rounded-lg bg-surface-2 px-2 py-2 text-center">
              <span className="mr-1 text-xs text-ink-2">淨離子反應</span>
              <Hl k="H">
                <Chem>H^+</Chem>
              </Hl>{' '}
              +{' '}
              <Hl k="OH">
                <Chem>OH^-</Chem>
              </Hl>{' '}
              →{' '}
              <Hl k="H2O">
                <Chem>H2O</Chem>
              </Hl>
            </div>
            <PhCurve cAcid={cAcid} vAcid={vAcid} cBase={cBase} vMax={vMax} vEq={vEq} v={v} pH={pH} />
          </div>
        }
      />
    </div>
  )
}

/** 粒子種類：key 與 Hl 相同，用來同步高亮 */
const ION_KINDS: ParticleKind[] = [
  { key: 'Cl', label: 'Cl⁻', fill: '#22c55e', text: '#052e16' },
  { key: 'Na', label: 'Na⁺', fill: '#a78bfa', text: '#2e1065' },
  { key: 'H', label: 'H⁺', fill: '#f87171', text: '#450a0a' },
  { key: 'OH', label: 'OH⁻', fill: '#60a5fa', text: '#172554' },
  { key: 'H2O', label: 'H₂O', fill: '#e2e8f0', text: '#334155', r: 6 },
]

function Setting({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="text-sm">
      <div className="mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

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
