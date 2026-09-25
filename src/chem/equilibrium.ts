import { seeded } from '../lib/random'

const R = 8.314 // J/(mol·K)

export interface EqSpecies {
  /** Chem 字串 */
  formula: string
  /** 係數：反應物為負、生成物為正 */
  nu: number
  nameZh: string
  /** 巨觀顏色（溶液或氣體的真實顏色），無色則省略 */
  color?: string
  colorName: string
  /** 濃度由外部固定（例如以 pH 控制的 H⁺），不列入莫耳數計算 */
  fixed?: boolean
}

export type Perturbation =
  | { kind: 'heat' }
  | { kind: 'cool' }
  | { kind: 'compress' }
  | { kind: 'expand' }
  | { kind: 'dilute' }
  | { kind: 'add'; formula: string }
  | { kind: 'remove'; formula: string }
  | { kind: 'acid' }
  | { kind: 'base' }
  | { kind: 'catalyst' }

export interface EqSystem {
  id: string
  nameZh: string
  level: 'junior' | 'senior'
  species: EqSpecies[]
  /** 參考溫度下的平衡常數（濃度平衡常數 Kc） */
  k0: number
  t0: number
  /** 正反應的反應熱（kJ/mol），吸熱為正 */
  dH: number
  /** 初始莫耳數（依 species 順序，固定濃度者填 0） */
  n0: number[]
  v0: number
  /** 初始 pH（只用於有固定 H⁺ 的系統） */
  pH0?: number
  /** 這個系統提供的操作 */
  actions: Perturbation[]
  gas: boolean
  note: string
}

export const EQ_SYSTEMS: EqSystem[] = [
  {
    id: 'no2',
    nameZh: '四氧化二氮與二氧化氮',
    level: 'junior',
    species: [
      { formula: 'N2O4', nu: -1, nameZh: '四氧化二氮', colorName: '無色' },
      { formula: 'NO2', nu: 2, nameZh: '二氧化氮', color: '#9a3412', colorName: '紅棕色' },
    ],
    k0: 4.6e-3,
    t0: 298,
    dH: 57.2,
    n0: [0.1, 0],
    v0: 1,
    actions: [{ kind: 'heat' }, { kind: 'cool' }, { kind: 'compress' }, { kind: 'expand' }, { kind: 'add', formula: 'NO2' }, { kind: 'add', formula: 'N2O4' }, { kind: 'catalyst' }],
    gas: true,
    note: '把裝有紅棕色氣體的密閉瓶放進熱水，顏色變深；放進冰水，顏色變淡。',
  },
  {
    id: 'chromate',
    nameZh: '鉻酸根與二鉻酸根',
    level: 'junior',
    species: [
      { formula: 'CrO4^2-', nu: -2, nameZh: '鉻酸根', color: '#eab308', colorName: '黃色' },
      { formula: 'H^+', nu: -2, nameZh: '氫離子', colorName: '無色', fixed: true },
      { formula: 'Cr2O7^2-', nu: 1, nameZh: '二鉻酸根', color: '#ea580c', colorName: '橙色' },
    ],
    k0: 3e14,
    t0: 298,
    dH: 0,
    n0: [0.02, 0, 0],
    v0: 1,
    pH0: 7,
    actions: [{ kind: 'acid' }, { kind: 'base' }, { kind: 'dilute' }],
    gas: false,
    note: '在黃色的鉻酸鉀溶液中加酸，變成橙色；再加鹼，又變回黃色。（反應式右邊還有 H₂O，水是溶劑，不列入平衡常數）',
  },
  {
    id: 'fescn',
    nameZh: '鐵離子與硫氰酸根',
    level: 'senior',
    species: [
      { formula: 'Fe^3+', nu: -1, nameZh: '鐵離子', color: '#ca8a04', colorName: '淡黃色' },
      { formula: 'SCN^-', nu: -1, nameZh: '硫氰酸根', colorName: '無色' },
      { formula: 'FeSCN^2+', nu: 1, nameZh: '硫氰酸鐵離子', color: '#b91c1c', colorName: '血紅色' },
    ],
    k0: 9e2,
    t0: 298,
    dH: 0,
    n0: [0.002, 0.002, 0],
    v0: 1,
    actions: [{ kind: 'add', formula: 'Fe^3+' }, { kind: 'add', formula: 'SCN^-' }, { kind: 'dilute' }],
    gas: false,
    note: '加入鐵離子或硫氰酸根，血紅色都會變深；加水稀釋，顏色變淡的程度比單純稀釋更多。',
  },
  {
    id: 'haber',
    nameZh: '哈柏法合成氨',
    level: 'senior',
    species: [
      { formula: 'N2', nu: -1, nameZh: '氮氣', colorName: '無色' },
      { formula: 'H2', nu: -3, nameZh: '氫氣', colorName: '無色' },
      { formula: 'NH3', nu: 2, nameZh: '氨', colorName: '無色' },
    ],
    k0: 0.058,
    t0: 773,
    dH: -92,
    n0: [1, 3, 0],
    v0: 10,
    actions: [{ kind: 'heat' }, { kind: 'cool' }, { kind: 'compress' }, { kind: 'expand' }, { kind: 'add', formula: 'N2' }, { kind: 'remove', formula: 'NH3' }, { kind: 'catalyst' }],
    gas: true,
    note: '工業上用鐵作催化劑、約 450–500 °C、高壓合成氨。催化劑讓反應更快達到平衡，但不會改變平衡時的產量。',
  },
]

export interface EqState {
  /** 依 species 順序的莫耳數 */
  n: number[]
  /** 體積（L） */
  v: number
  /** 溫度（K） */
  t: number
  pH: number
}

export function initialState(sys: EqSystem): EqState {
  return { n: [...sys.n0], v: sys.v0, t: sys.t0, pH: sys.pH0 ?? 7 }
}

/** van 't Hoff：溫度改變時的平衡常數 */
export function kAt(sys: EqSystem, t: number): number {
  return sys.k0 * Math.exp((-sys.dH * 1000 / R) * (1 / t - 1 / sys.t0))
}

function conc(sys: EqSystem, s: EqState, i: number): number {
  return sys.species[i].fixed ? 10 ** -s.pH : s.n[i] / s.v
}

/** 反應商 Q（以 ln 表示，避免溢位）；有濃度為 0 時可能是 ±Infinity */
export function lnQ(sys: EqSystem, s: EqState): number {
  return sys.species.reduce((acc, sp, i) => acc + sp.nu * Math.log(conc(sys, s, i)), 0)
}

export function reactionQuotient(sys: EqSystem, s: EqState): number {
  return Math.exp(lnQ(sys, s))
}

/** 依反應進度 ξ 移動後的莫耳數 */
function shifted(sys: EqSystem, s: EqState, xi: number): EqState {
  return { ...s, n: s.n.map((n, i) => (sys.species[i].fixed ? n : Math.max(0, n + sys.species[i].nu * xi))) }
}

/** 求新的平衡組成：在可行的反應進度範圍內，以二分法解 ln Q(ξ) = ln K */
export function solveEquilibrium(sys: EqSystem, s: EqState): EqState {
  const lnK = Math.log(kAt(sys, s.t))
  let lo = -Infinity
  let hi = Infinity
  sys.species.forEach((sp, i) => {
    if (sp.fixed) return
    const limit = s.n[i] / Math.abs(sp.nu)
    if (sp.nu < 0) hi = Math.min(hi, limit)
    else lo = Math.max(lo, -limit)
  })
  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2
    const f = lnQ(sys, shifted(sys, s, mid)) - lnK
    if (f > 0) hi = mid
    else lo = mid
  }
  return shifted(sys, s, (lo + hi) / 2)
}

/** 套用擾動（瞬間改變，尚未重新平衡） */
export function applyPerturbation(sys: EqSystem, s: EqState, p: Perturbation): EqState {
  const idx = (f: string) => sys.species.findIndex((sp) => sp.formula === f)
  switch (p.kind) {
    case 'heat':
      return { ...s, t: s.t + 50 }
    case 'cool':
      return { ...s, t: s.t - 50 }
    case 'compress':
      return { ...s, v: s.v / 2 }
    case 'expand':
    case 'dilute':
      return { ...s, v: s.v * 2 }
    case 'acid':
      return { ...s, pH: Math.max(1, s.pH - 2) }
    case 'base':
      return { ...s, pH: Math.min(13, s.pH + 2) }
    case 'add': {
      const i = idx(p.formula)
      const amount = Math.max(...sys.n0) * 0.5
      return { ...s, n: s.n.map((n, j) => (j === i ? n + amount : n)) }
    }
    case 'remove': {
      const i = idx(p.formula)
      return { ...s, n: s.n.map((n, j) => (j === i ? n * 0.2 : n)) }
    }
    case 'catalyst':
      return s
  }
}

export type Shift = 'right' | 'left' | 'none'

/** 擾動後平衡往哪邊移動：比較擾動後的 Q 與新的 K */
export function shiftDirection(sys: EqSystem, perturbed: EqState): Shift {
  const d = lnQ(sys, perturbed) - Math.log(kAt(sys, perturbed.t))
  if (Math.abs(d) < 1e-6) return 'none'
  return d < 0 ? 'right' : 'left'
}

export const PERTURBATION_LABEL: Record<Perturbation['kind'], string> = {
  heat: '加熱（+50 K）',
  cool: '冷卻（−50 K）',
  compress: '壓縮體積（½）',
  expand: '擴大體積（×2）',
  dilute: '加水稀釋（×2）',
  add: '加入',
  remove: '移走大部分',
  acid: '加酸（pH −2）',
  base: '加鹼（pH +2）',
  catalyst: '加催化劑',
}

/** 從擾動後狀態回到新平衡的時間序列（指數趨近，示意用）；有催化劑時較快 */
export function relaxPath(from: EqState, to: EqState, steps = 30, fast = false): number[][] {
  const tau = fast ? 3 : 8
  return Array.from({ length: steps + 1 }, (_, k) => {
    const w = Math.exp(-k / tau)
    return from.n.map((n, i) => to.n[i] + (n - to.n[i]) * w)
  })
}

// ---- 動態平衡粒子模擬（A ⇌ B） ----

export interface DynamicStep {
  a: number
  b: number
  /** 這一步發生的正、逆反應次數 */
  forward: number
  reverse: number
}

/** 每個 A 每步有 pf 的機率變成 B，每個 B 有 pr 的機率變回 A（固定種子，結果可重現） */
export function simulateDynamic(total: number, startA: number, pf: number, pr: number, steps: number, seed = 1): DynamicStep[] {
  let a = startA
  let b = total - startA
  let r = seed * 7919
  const out: DynamicStep[] = [{ a, b, forward: 0, reverse: 0 }]
  for (let t = 0; t < steps; t++) {
    let forward = 0
    let reverse = 0
    for (let i = 0; i < a; i++) if (seeded(++r) < pf) forward++
    for (let i = 0; i < b; i++) if (seeded(++r) < pr) reverse++
    a = a - forward + reverse
    b = b + forward - reverse
    out.push({ a, b, forward, reverse })
  }
  return out
}
