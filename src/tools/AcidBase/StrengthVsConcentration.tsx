import { useState } from 'react'
import {
  acidityLabel,
  conductivity,
  dissociationFraction,
  ELECTROLYTES,
  electrolytePh,
  indicatorColor,
  INDICATORS,
  ionizedConcentration,
  rgbaCss,
  type Electrolyte,
} from '../../chem/acidBase'
import { Chem } from '../../components/Chem'
import { Hl } from '../../components/triplet/Highlight'
import { ParticleBox, type ParticleKind } from '../../components/triplet/ParticleBox'
import { TripletLayout } from '../../components/triplet/TripletLayout'
import { Card, CardTitle, Chip, Segmented } from '../../components/ui'
import type { Level } from '../../learning/concepts'
import { sci } from '../../lib/format'
import { Beaker } from './Beaker'

const CONCENTRATIONS = [0.02, 0.05, 0.1, 0.2]
const UNIVERSAL = INDICATORS.find((i) => i.id === 'universal')!

/** 粒子盒中的標籤（圓圈很小，用簡寫；圖例再列完整化學式） */
const SHORT: Record<string, string> = {
  HCl: 'HCl',
  HNO3: 'HNO₃',
  CH3COOH: 'HAc',
  HF: 'HF',
  NaOH: 'NaOH',
  NH3: 'NH₃',
  'Cl^-': 'Cl⁻',
  'NO3^-': 'NO₃⁻',
  'CH3COO^-': 'Ac⁻',
  'F^-': 'F⁻',
  'Na^+': 'Na⁺',
  'NH4^+': 'NH₄⁺',
}

interface Cup {
  id: string
  c: number
}

const PRESETS: { label: string; left: Cup; right: Cup }[] = [
  { label: '濃度相同：鹽酸 vs 醋酸', left: { id: 'HCl', c: 0.1 }, right: { id: 'CH3COOH', c: 0.1 } },
  { label: '稀的強酸 vs 濃的弱酸', left: { id: 'HCl', c: 0.02 }, right: { id: 'CH3COOH', c: 0.2 } },
  { label: '氫氧化鈉 vs 氨水', left: { id: 'NaOH', c: 0.1 }, right: { id: 'NH3', c: 0.1 } },
]

const byId = (id: string) => ELECTROLYTES.find((e) => e.id === id) ?? ELECTROLYTES[0]

function cupFromParams(params: URLSearchParams, side: 'left' | 'right', fallback: Cup): Cup {
  const id = params.get(side)
  const c = Number(params.get(side === 'left' ? 'lc' : 'rc'))
  return {
    id: id && ELECTROLYTES.some((e) => e.id === id) ? id : fallback.id,
    c: CONCENTRATIONS.includes(c) ? c : fallback.c,
  }
}

/** 每個杯子的粒子：以 100 × 濃度（M）個「分子」代表溶質，再依解離度拆成離子 */
function particles(e: Electrolyte, c: number) {
  const n = Math.round(c * 100)
  const alpha = dissociationFraction(e, c)
  const ionized = e.strong ? n : Math.max(alpha > 0 ? 1 : 0, Math.round(n * alpha))
  const [main, counter] = e.ions
  const kinds: ParticleKind[] = [
    { key: e.formula, label: SHORT[e.id], fill: '#fbbf24', text: '#422006', r: 8 },
    { key: main, label: main === 'H^+' ? 'H⁺' : 'OH⁻', fill: main === 'H^+' ? '#f87171' : '#60a5fa', text: '#0f172a' },
    { key: counter, label: SHORT[counter], fill: '#cbd5e1', text: '#1e293b' },
  ]
  return { kinds, counts: [n - ionized, ionized, ionized], n, ionized }
}

export function StrengthVsConcentration({ params }: { params: URLSearchParams }) {
  const [left, setLeft] = useState<Cup>(() => cupFromParams(params, 'left', PRESETS[0].left))
  const [right, setRight] = useState<Cup>(() => cupFromParams(params, 'right', PRESETS[0].right))
  const [level, setLevel] = useState<Level>(params.get('level') === 'senior' ? 'senior' : 'junior')
  const cups = [
    { side: '左杯', cup: left, set: setLeft },
    { side: '右杯', cup: right, set: setRight },
  ]

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>比較兩杯溶液</CardTitle>
          <Segmented<Level>
            value={level}
            onChange={setLevel}
            options={[
              { value: 'junior', label: '國中' },
              { value: 'senior', label: '高中（Ka、解離度）' },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs text-ink-2">快速比較：</span>
          {PRESETS.map((p) => (
            <Chip
              key={p.label}
              active={left.id === p.left.id && left.c === p.left.c && right.id === p.right.id && right.c === p.right.c}
              onClick={() => {
                setLeft(p.left)
                setRight(p.right)
              }}
            >
              {p.label}
            </Chip>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {cups.map(({ side, cup, set }) => (
            <div key={side} className="space-y-2 rounded-lg border border-line p-3">
              <div className="text-sm font-semibold">{side}</div>
              <div className="flex flex-wrap gap-1.5">
                {ELECTROLYTES.map((e) => (
                  <Chip key={e.id} active={cup.id === e.id} onClick={() => set({ ...cup, id: e.id })}>
                    {e.nameZh}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="text-ink-2">濃度</span>
                {CONCENTRATIONS.map((c) => (
                  <Chip key={c} active={cup.c === c} onClick={() => set({ ...cup, c })}>
                    {c} M
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <TripletLayout
        macro={
          <div className="grid grid-cols-2 gap-3">
            {cups.map(({ side, cup }) => (
              <MacroCup key={side} side={side} e={byId(cup.id)} c={cup.c} />
            ))}
          </div>
        }
        micro={
          <div className="space-y-3">
            {cups.map(({ side, cup }) => (
              <MicroCup key={side} side={side} e={byId(cup.id)} c={cup.c} />
            ))}
          </div>
        }
        symbolic={
          <div className="space-y-4">
            {cups.map(({ side, cup }) => (
              <SymbolicCup key={side} side={side} e={byId(cup.id)} c={cup.c} level={level} />
            ))}
          </div>
        }
      />
    </div>
  )
}

function MacroCup({ side, e, c }: { side: string; e: Electrolyte; c: number }) {
  const pH = electrolytePh(e, c)
  const glow = conductivity(e, c)
  return (
    <div className="space-y-1 text-center">
      <div className="text-xs text-ink-2">
        {side}・{c} M {e.nameZh}
      </div>
      <Bulb brightness={glow} />
      <Beaker color={rgbaCss(indicatorColor(pH, UNIVERSAL))} fill={0.6} label={`${e.nameZh}加廣用試劑的顏色`} />
      <div className="font-mono text-2xl font-bold tabular-nums">{pH.toFixed(2)}</div>
      <div className="text-xs text-ink-2">
        pH・{acidityLabel(pH)}・燈泡{glow > 0.75 ? '很亮' : glow > 0.45 ? '微亮' : '幾乎不亮'}
      </div>
    </div>
  )
}

function Bulb({ brightness }: { brightness: number }) {
  return (
    <svg viewBox="0 0 60 60" className="mx-auto h-14" role="img" aria-label={`導電燈泡亮度 ${Math.round(brightness * 100)}%`}>
      <circle cx={30} cy={24} r={22} fill="#facc15" opacity={brightness * 0.35} />
      <circle cx={30} cy={24} r={13} fill="#fde047" fillOpacity={0.15 + brightness * 0.85} stroke="var(--ink-2)" strokeWidth={1.5} />
      <rect x={24} y={37} width={12} height={9} rx={2} fill="var(--ink-2)" />
    </svg>
  )
}

function MicroCup({ side, e, c }: { side: string; e: Electrolyte; c: number }) {
  const { kinds, counts, n, ionized } = particles(e, c)
  return (
    <div>
      <div className="mb-1 text-xs text-ink-2">
        {side}：{n} 個 <Chem>{e.formula}</Chem> 中有 {ionized} 個解離
      </div>
      <ParticleBox kinds={kinds} counts={counts} label={`${e.nameZh}：${n} 個溶質粒子中 ${ionized} 個解離`} />
      <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
        {kinds.map((k, i) => (
          <Hl key={k.key} k={k.key}>
            <span className="mr-1 inline-block size-2.5 rounded-full align-middle" style={{ background: k.fill }} />
            <Chem>{k.key}</Chem> × {counts[i]}
          </Hl>
        ))}
      </div>
    </div>
  )
}

function SymbolicCup({ side, e, c, level }: { side: string; e: Electrolyte; c: number; level: Level }) {
  const x = ionizedConcentration(e, c)
  const alpha = dissociationFraction(e, c)
  const pH = electrolytePh(e, c)
  const main = e.ions[0]
  const bracket = main === 'H^+' ? '[H⁺]' : '[OH⁻]'
  const [lhs, rhs] = e.equation.split(e.strong ? ' -> ' : ' <=> ')
  return (
    <div className="space-y-1.5 text-sm">
      <div className="text-xs text-ink-2">
        {side}・{c} M {e.nameZh}（{e.strong ? '強' : '弱'}{e.kind === 'acid' ? '酸' : '鹼'}）
      </div>
      <div className="overflow-x-auto rounded-lg bg-surface-2 px-2 py-2 text-center">
        <Chem>{lhs}</Chem> {e.strong ? '→' : '⇌'}{' '}
        {rhs.split(' + ').map((ion, i) => (
          <span key={ion}>
            {i > 0 && ' + '}
            <Hl k={ion}>
              <Chem>{ion}</Chem>
            </Hl>
          </span>
        ))}
      </div>
      {level === 'junior' ? (
        <p className="text-ink-2">
          {e.strong ? '幾乎全部解離成離子。' : `只有少部分解離（約 ${(alpha * 100).toFixed(1)}%），大部分仍是分子。`}
        </p>
      ) : (
        <div className="space-y-0.5 font-mono text-xs leading-relaxed">
          {e.strong ? (
            <div>完全解離：{bracket} = C = {c} M</div>
          ) : (
            <>
              <div>
                {e.kind === 'acid' ? 'Ka' : 'Kb'} = {e.k ? sci(e.k, 1) : ''} = x² / (C − x)
              </div>
              <div>
                {bracket} = x = {sci(x)} M
              </div>
              <div>α = x / C = {(alpha * 100).toFixed(2)}%</div>
            </>
          )}
          <div>
            {e.kind === 'acid'
              ? `pH = −log ${bracket} = ${pH.toFixed(2)}`
              : `pOH = −log ${bracket} = ${(14 - pH).toFixed(2)}，pH = ${pH.toFixed(2)}`}
          </div>
        </div>
      )}
    </div>
  )
}
