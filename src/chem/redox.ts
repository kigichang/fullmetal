import { gcd, parseFormula } from './formula'

// ---- 金屬活性、置換反應與電池 ----

export interface Metal {
  symbol: string
  nameZh: string
  /** 金屬離子（Chem 字串）與電荷 */
  ion: string
  charge: number
  /** 標準還原電位 E°（V），用來排活性與算電池電壓 */
  e0: number
  /** 金屬片的顏色 */
  color: string
  /** 常用的離子溶液 */
  solution: { formula: string; nameZh: string; color: string; colorName: string }
}

const CLEAR = 'rgba(186, 230, 253, 0.28)'

export const METALS: Metal[] = [
  { symbol: 'Mg', nameZh: '鎂', ion: 'Mg^2+', charge: 2, e0: -2.37, color: '#cbd5e1', solution: { formula: 'MgSO4', nameZh: '硫酸鎂', color: CLEAR, colorName: '無色' } },
  { symbol: 'Zn', nameZh: '鋅', ion: 'Zn^2+', charge: 2, e0: -0.76, color: '#94a3b8', solution: { formula: 'ZnSO4', nameZh: '硫酸鋅', color: CLEAR, colorName: '無色' } },
  { symbol: 'Fe', nameZh: '鐵', ion: 'Fe^2+', charge: 2, e0: -0.44, color: '#78716c', solution: { formula: 'FeSO4', nameZh: '硫酸亞鐵', color: 'rgba(163, 230, 53, 0.35)', colorName: '淡綠色' } },
  { symbol: 'Pb', nameZh: '鉛', ion: 'Pb^2+', charge: 2, e0: -0.13, color: '#475569', solution: { formula: 'Pb(NO3)2', nameZh: '硝酸鉛', color: CLEAR, colorName: '無色' } },
  { symbol: 'Cu', nameZh: '銅', ion: 'Cu^2+', charge: 2, e0: 0.34, color: '#c2410c', solution: { formula: 'CuSO4', nameZh: '硫酸銅', color: 'rgba(59, 130, 246, 0.55)', colorName: '藍色' } },
  { symbol: 'Ag', nameZh: '銀', ion: 'Ag^+', charge: 1, e0: 0.8, color: '#e2e8f0', solution: { formula: 'AgNO3', nameZh: '硝酸銀', color: CLEAR, colorName: '無色' } },
]

export const metalBySymbol = (s: string) => METALS.find((m) => m.symbol === s)!

/** 依活性由大到小排列（E° 越小越活潑） */
export const ACTIVITY_SERIES = [...METALS].sort((a, b) => a.e0 - b.e0)

const co = (n: number) => (n === 1 ? '' : String(n))

export interface Displacement {
  reacts: boolean
  /** 金屬失去電子數與離子得到電子數的配平係數 */
  metalCoef: number
  ionCoef: number
  electrons: number
  /** Chem 字串；不反應時為 null */
  netIonic: string | null
  oxidationHalf: string | null
  reductionHalf: string | null
}

/** 把金屬片放進另一種金屬的離子溶液：活性大的金屬才能置換出活性小的金屬 */
export function displacement(metal: Metal, ionOf: Metal): Displacement {
  const reacts = metal.symbol !== ionOf.symbol && metal.e0 < ionOf.e0
  const g = gcd(metal.charge, ionOf.charge)
  const metalCoef = ionOf.charge / g
  const ionCoef = metal.charge / g
  const electrons = metalCoef * metal.charge
  if (!reacts) return { reacts, metalCoef, ionCoef, electrons, netIonic: null, oxidationHalf: null, reductionHalf: null }
  return {
    reacts,
    metalCoef,
    ionCoef,
    electrons,
    netIonic: `${co(metalCoef)}${metal.symbol} + ${co(ionCoef)}${ionOf.ion} -> ${co(metalCoef)}${metal.ion} + ${co(ionCoef)}${ionOf.symbol}`,
    oxidationHalf: `${metal.symbol} -> ${metal.ion} + ${co(metal.charge)}e^-`,
    reductionHalf: `${ionOf.ion} + ${co(ionOf.charge)}e^- -> ${ionOf.symbol}`,
  }
}

export interface Cell {
  /** 負極（陽極，發生氧化）：活性較大的金屬 */
  anode: Metal
  /** 正極（陰極，發生還原） */
  cathode: Metal
  /** 標準電池電壓（V） */
  voltage: number
  overall: string
}

/** 兩種金屬與各自離子溶液組成的電池（例如鋅銅電池）；兩者相同時回傳 null */
export function galvanicCell(a: Metal, b: Metal): Cell | null {
  if (a.symbol === b.symbol) return null
  const [anode, cathode] = a.e0 < b.e0 ? [a, b] : [b, a]
  const d = displacement(anode, cathode)
  return { anode, cathode, voltage: Math.round((cathode.e0 - anode.e0) * 100) / 100, overall: d.netIonic! }
}

// ---- 氧化數 ----

/** 解析含電荷的物種，例如 "Cr2O7^2-" → { atoms, charge: -2 } */
export function parseSpecies(species: string): { atoms: Record<string, number>; charge: number } {
  const [formula, chargeStr] = species.split('^')
  let charge = 0
  if (chargeStr) {
    const m = /^(\d*)([+-])$/.exec(chargeStr)
    if (!m) throw new Error(`無法解析電荷：${species}`)
    charge = (m[1] ? parseInt(m[1], 10) : 1) * (m[2] === '+' ? 1 : -1)
  }
  return { atoms: parseFormula(formula), charge }
}

const GROUP1 = new Set(['Li', 'Na', 'K'])
const GROUP2 = new Set(['Mg', 'Ca', 'Ba'])
const FIXED_METALS: Record<string, number> = { Al: 3, Zn: 2, Ag: 1 }
const HALOGENS = new Set(['Cl', 'Br', 'I'])
const PEROXIDES = new Set(['H2O2', 'Na2O2', 'BaO2'])

export interface OxidationResult {
  numbers: Record<string, number>
  /** 推導過程（可含 {{Chem}} 片段） */
  steps: string[]
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

/**
 * 依課本規則推算氧化數：元素態為 0；F −1；第 1、2 族金屬 +1、+2；
 * H 通常 +1（金屬氫化物中 −1）；O 通常 −2（過氧化物 −1）；
 * 鹵素與金屬或 H 結合時 −1；剩下一種元素由總電荷求出。
 */
export function oxidationNumbers(species: string): OxidationResult {
  const { atoms, charge } = parseSpecies(species)
  const formula = species.split('^')[0]
  const elements = Object.keys(atoms)
  const numbers: Record<string, number> = {}
  const steps: string[] = []

  if (elements.length === 1) {
    const [el] = elements
    numbers[el] = charge / atoms[el]
    steps.push(charge === 0 ? `元素態（只由 ${el} 組成）的氧化數為 0` : `單原子離子的氧化數等於它的電荷：${signed(numbers[el])}`)
    return { numbers, steps }
  }

  const hasO = 'O' in atoms
  const metals = elements.filter((e) => GROUP1.has(e) || GROUP2.has(e))
  for (const el of elements) {
    if (el === 'F') {
      numbers[el] = -1
      steps.push('F 在化合物中都是 −1')
    } else if (GROUP1.has(el)) {
      numbers[el] = 1
      steps.push(`${el} 是第 1 族金屬，氧化數 +1`)
    } else if (GROUP2.has(el)) {
      numbers[el] = 2
      steps.push(`${el} 是第 2 族金屬，氧化數 +2`)
    } else if (el in FIXED_METALS) {
      numbers[el] = FIXED_METALS[el]
      steps.push(`${el} 在化合物中通常是 ${signed(FIXED_METALS[el])}`)
    }
  }
  if ('H' in atoms) {
    const hydride = metals.length > 0 && elements.every((e) => e === 'H' || metals.includes(e))
    numbers.H = hydride ? -1 : 1
    steps.push(hydride ? 'H 與活潑金屬形成氫化物時為 −1' : 'H 通常是 +1')
  }
  if (hasO && !('F' in atoms)) {
    const peroxide = PEROXIDES.has(formula)
    numbers.O = peroxide ? -1 : -2
    steps.push(peroxide ? '過氧化物中 O 為 −1' : 'O 通常是 −2')
  }
  for (const el of elements) {
    if (HALOGENS.has(el) && !hasO && !(el in numbers)) {
      numbers[el] = -1
      steps.push(`${el} 與金屬或 H 結合時為 −1`)
    }
  }

  const unknown = elements.filter((e) => !(e in numbers))
  if (unknown.length > 1) throw new Error(`無法只用規則求出：${species}`)
  if (unknown.length === 1) {
    const [el] = unknown
    const known = elements.filter((e) => e !== el).reduce((s, e) => s + numbers[e] * atoms[e], 0)
    numbers[el] = (charge - known) / atoms[el]
    const total = charge === 0 ? '化合物的氧化數總和為 0' : `離子的氧化數總和等於電荷 ${signed(charge)}`
    steps.push(`${total}，所以 ${el} = ${signed(Math.round(numbers[el] * 100) / 100)}`)
  }
  return { numbers, steps }
}

// ---- 反應分析 ----

export interface RedoxReaction {
  id: string
  nameZh: string
  /** [係數, 物種] */
  reactants: [number, string][]
  products: [number, string][]
  /** 國中「得氧／失氧」的觀點（只標在有氧轉移的反應） */
  oxygenView?: { gainsO: string; losesO: string }
  note?: string
}

export const REDOX_REACTIONS: RedoxReaction[] = [
  { id: 'cuo-h2', nameZh: '氫氣還原氧化銅', reactants: [[1, 'CuO'], [1, 'H2']], products: [[1, 'Cu'], [1, 'H2O']], oxygenView: { gainsO: 'H2', losesO: 'CuO' }, note: '黑色的氧化銅變成紅色的銅。' },
  { id: 'c-cuo', nameZh: '木炭還原氧化銅', reactants: [[1, 'C'], [2, 'CuO']], products: [[2, 'Cu'], [1, 'CO2']], oxygenView: { gainsO: 'C', losesO: 'CuO' }, note: '產生的二氧化碳可使澄清石灰水變混濁。' },
  { id: 'blast', nameZh: '高爐煉鐵', reactants: [[1, 'Fe2O3'], [3, 'CO']], products: [[2, 'Fe'], [3, 'CO2']], oxygenView: { gainsO: 'CO', losesO: 'Fe2O3' } },
  { id: 'mg-o2', nameZh: '鎂帶燃燒', reactants: [[2, 'Mg'], [1, 'O2']], products: [[2, 'MgO']], oxygenView: { gainsO: 'Mg', losesO: 'O2' }, note: '氧氣本身被還原，是氧化劑。' },
  { id: 'zn-cu', nameZh: '鋅置換銅離子', reactants: [[1, 'Zn'], [1, 'Cu^2+']], products: [[1, 'Zn^2+'], [1, 'Cu']], note: '沒有氧參與，但仍然是氧化還原：鋅失去電子、銅離子得到電子。' },
  { id: 'cl-ki', nameZh: '氯氣與碘化鉀', reactants: [[1, 'Cl2'], [2, 'KI']], products: [[2, 'KCl'], [1, 'I2']] },
  { id: 'na-water', nameZh: '鈉與水反應', reactants: [[2, 'Na'], [2, 'H2O']], products: [[2, 'NaOH'], [1, 'H2']] },
  { id: 'h2o2', nameZh: '雙氧水分解', reactants: [[2, 'H2O2']], products: [[2, 'H2O'], [1, 'O2']], note: '同一種元素（O）一部分被氧化、一部分被還原，稱為自身氧化還原。' },
  { id: 'neutral', nameZh: '鹽酸與氫氧化鈉中和', reactants: [[1, 'HCl'], [1, 'NaOH']], products: [[1, 'NaCl'], [1, 'H2O']], note: '所有元素的氧化數都沒有改變，不是氧化還原反應。' },
  { id: 'caco3', nameZh: '碳酸鈣受熱分解', reactants: [[1, 'CaCO3']], products: [[1, 'CaO'], [1, 'CO2']], note: '分解反應不一定是氧化還原。' },
]

export interface ElementChange {
  element: string
  /** 反應物中含此元素的物種與氧化數 */
  from: { species: string; n: number }[]
  to: { species: string; n: number }[]
  change: 'oxidized' | 'reduced' | 'both' | 'none'
}

export interface RedoxAnalysis {
  isRedox: boolean
  elements: ElementChange[]
  /** 氧化劑（本身被還原）與還原劑（本身被氧化） */
  oxidizingAgents: string[]
  reducingAgents: string[]
  /** 轉移的電子總數（依係數計，以被氧化的一方計算） */
  electrons: number
}

export function analyzeRedox(r: RedoxReaction): RedoxAnalysis {
  const side = (list: [number, string][]) =>
    list.map(([coef, sp]) => ({ coef, species: sp, atoms: parseSpecies(sp).atoms, ox: oxidationNumbers(sp).numbers }))
  const L = side(r.reactants)
  const R = side(r.products)
  const elements = [...new Set(L.flatMap((s) => Object.keys(s.atoms)))]

  const oxidizingAgents = new Set<string>()
  const reducingAgents = new Set<string>()
  let electrons = 0

  const changes: ElementChange[] = elements.map((element) => {
    const from = L.filter((s) => element in s.atoms).map((s) => ({ species: s.species, n: s.ox[element] }))
    const to = R.filter((s) => element in s.atoms).map((s) => ({ species: s.species, n: s.ox[element] }))
    const up = to.some((t) => from.some((f) => t.n > f.n))
    const down = to.some((t) => from.some((f) => t.n < f.n))
    const change = up && down ? 'both' : up ? 'oxidized' : down ? 'reduced' : 'none'
    for (const f of L.filter((s) => element in s.atoms)) {
      if (up) reducingAgents.add(f.species)
      if (down) oxidizingAgents.add(f.species)
    }
    if (up) {
      // 以產物中氧化數上升的原子數 × 上升量計算電子數
      for (const p of R.filter((s) => element in s.atoms)) {
        const before = Math.min(...from.map((f) => f.n))
        if (p.ox[element] > before) electrons += p.coef * p.atoms[element] * (p.ox[element] - before)
      }
    }
    return { element, from, to, change }
  })

  const isRedox = changes.some((c) => c.change !== 'none')
  return { isRedox, elements: changes, oxidizingAgents: [...oxidizingAgents], reducingAgents: [...reducingAgents], electrons: Math.round(electrons) }
}

export const formatOx = signed
