export type Category =
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide'
  | 'unknown'

export type MetalClass = 'metal' | 'metalloid' | 'nonmetal' | 'unknown'
export type State = 'solid' | 'liquid' | 'gas' | 'unknown'

export interface PeriodicElement {
  z: number
  symbol: string
  nameZh: string
  nameEn: string
  /** 標準原子量；無穩定同位素者為最穩定同位素的質量數 */
  mass: number
  /** 質量數（顯示時加方括號） */
  massIsMassNumber: boolean
  period: number
  /** 族（1–18）；鑭系、錒系為 null */
  group: number | null
  category: Category
  state: State
  /** 各電子層（K、L、M…）的電子數 */
  shells: number[]
  /** 電子組態（以鈍氣核心簡寫） */
  configuration: string
  /** 國中課本常見的元素 */
  juniorHigh: boolean
  note?: string
}

// [符號, 中文, 英文, 原子量]
const RAW: [string, string, string, number][] = [
  ['H', '氫', 'Hydrogen', 1.008],
  ['He', '氦', 'Helium', 4.0026],
  ['Li', '鋰', 'Lithium', 6.94],
  ['Be', '鈹', 'Beryllium', 9.0122],
  ['B', '硼', 'Boron', 10.81],
  ['C', '碳', 'Carbon', 12.011],
  ['N', '氮', 'Nitrogen', 14.007],
  ['O', '氧', 'Oxygen', 15.999],
  ['F', '氟', 'Fluorine', 18.998],
  ['Ne', '氖', 'Neon', 20.18],
  ['Na', '鈉', 'Sodium', 22.99],
  ['Mg', '鎂', 'Magnesium', 24.305],
  ['Al', '鋁', 'Aluminium', 26.982],
  ['Si', '矽', 'Silicon', 28.085],
  ['P', '磷', 'Phosphorus', 30.974],
  ['S', '硫', 'Sulfur', 32.06],
  ['Cl', '氯', 'Chlorine', 35.45],
  ['Ar', '氬', 'Argon', 39.948],
  ['K', '鉀', 'Potassium', 39.098],
  ['Ca', '鈣', 'Calcium', 40.078],
  ['Sc', '鈧', 'Scandium', 44.956],
  ['Ti', '鈦', 'Titanium', 47.867],
  ['V', '釩', 'Vanadium', 50.942],
  ['Cr', '鉻', 'Chromium', 51.996],
  ['Mn', '錳', 'Manganese', 54.938],
  ['Fe', '鐵', 'Iron', 55.845],
  ['Co', '鈷', 'Cobalt', 58.933],
  ['Ni', '鎳', 'Nickel', 58.693],
  ['Cu', '銅', 'Copper', 63.546],
  ['Zn', '鋅', 'Zinc', 65.38],
  ['Ga', '鎵', 'Gallium', 69.723],
  ['Ge', '鍺', 'Germanium', 72.63],
  ['As', '砷', 'Arsenic', 74.922],
  ['Se', '硒', 'Selenium', 78.971],
  ['Br', '溴', 'Bromine', 79.904],
  ['Kr', '氪', 'Krypton', 83.798],
  ['Rb', '銣', 'Rubidium', 85.468],
  ['Sr', '鍶', 'Strontium', 87.62],
  ['Y', '釔', 'Yttrium', 88.906],
  ['Zr', '鋯', 'Zirconium', 91.224],
  ['Nb', '鈮', 'Niobium', 92.906],
  ['Mo', '鉬', 'Molybdenum', 95.95],
  ['Tc', '鎝', 'Technetium', 98],
  ['Ru', '釕', 'Ruthenium', 101.07],
  ['Rh', '銠', 'Rhodium', 102.91],
  ['Pd', '鈀', 'Palladium', 106.42],
  ['Ag', '銀', 'Silver', 107.87],
  ['Cd', '鎘', 'Cadmium', 112.41],
  ['In', '銦', 'Indium', 114.82],
  ['Sn', '錫', 'Tin', 118.71],
  ['Sb', '銻', 'Antimony', 121.76],
  ['Te', '碲', 'Tellurium', 127.6],
  ['I', '碘', 'Iodine', 126.9],
  ['Xe', '氙', 'Xenon', 131.29],
  ['Cs', '銫', 'Caesium', 132.91],
  ['Ba', '鋇', 'Barium', 137.33],
  ['La', '鑭', 'Lanthanum', 138.91],
  ['Ce', '鈰', 'Cerium', 140.12],
  ['Pr', '鐠', 'Praseodymium', 140.91],
  ['Nd', '釹', 'Neodymium', 144.24],
  ['Pm', '鉕', 'Promethium', 145],
  ['Sm', '釤', 'Samarium', 150.36],
  ['Eu', '銪', 'Europium', 151.96],
  ['Gd', '釓', 'Gadolinium', 157.25],
  ['Tb', '鋱', 'Terbium', 158.93],
  ['Dy', '鏑', 'Dysprosium', 162.5],
  ['Ho', '鈥', 'Holmium', 164.93],
  ['Er', '鉺', 'Erbium', 167.26],
  ['Tm', '銩', 'Thulium', 168.93],
  ['Yb', '鐿', 'Ytterbium', 173.05],
  ['Lu', '鎦', 'Lutetium', 174.97],
  ['Hf', '鉿', 'Hafnium', 178.49],
  ['Ta', '鉭', 'Tantalum', 180.95],
  ['W', '鎢', 'Tungsten', 183.84],
  ['Re', '錸', 'Rhenium', 186.21],
  ['Os', '鋨', 'Osmium', 190.23],
  ['Ir', '銥', 'Iridium', 192.22],
  ['Pt', '鉑', 'Platinum', 195.08],
  ['Au', '金', 'Gold', 196.97],
  ['Hg', '汞', 'Mercury', 200.59],
  ['Tl', '鉈', 'Thallium', 204.38],
  ['Pb', '鉛', 'Lead', 207.2],
  ['Bi', '鉍', 'Bismuth', 208.98],
  ['Po', '釙', 'Polonium', 209],
  ['At', '砈', 'Astatine', 210],
  ['Rn', '氡', 'Radon', 222],
  ['Fr', '鍅', 'Francium', 223],
  ['Ra', '鐳', 'Radium', 226],
  ['Ac', '錒', 'Actinium', 227],
  ['Th', '釷', 'Thorium', 232.04],
  ['Pa', '鏷', 'Protactinium', 231.04],
  ['U', '鈾', 'Uranium', 238.03],
  ['Np', '錼', 'Neptunium', 237],
  ['Pu', '鈽', 'Plutonium', 244],
  ['Am', '鋂', 'Americium', 243],
  ['Cm', '鋦', 'Curium', 247],
  ['Bk', '鉳', 'Berkelium', 247],
  ['Cf', '鉲', 'Californium', 251],
  ['Es', '鑀', 'Einsteinium', 252],
  ['Fm', '鐨', 'Fermium', 257],
  ['Md', '鍆', 'Mendelevium', 258],
  ['No', '鍩', 'Nobelium', 259],
  ['Lr', '鐒', 'Lawrencium', 266],
  ['Rf', '鑪', 'Rutherfordium', 267],
  ['Db', '𨧀', 'Dubnium', 268],
  ['Sg', '𨭎', 'Seaborgium', 269],
  ['Bh', '𨨏', 'Bohrium', 270],
  ['Hs', '𨭆', 'Hassium', 269],
  ['Mt', '䥑', 'Meitnerium', 278],
  ['Ds', '鐽', 'Darmstadtium', 281],
  ['Rg', '錀', 'Roentgenium', 282],
  ['Cn', '鎶', 'Copernicium', 285],
  ['Nh', '鉨', 'Nihonium', 286],
  ['Fl', '鈇', 'Flerovium', 290],
  ['Mc', '鏌', 'Moscovium', 290],
  ['Lv', '鉝', 'Livermorium', 293],
  ['Ts', '鿬', 'Tennessine', 294],
  ['Og', '鿫', 'Oganesson', 294],
]

const NOTES: Record<string, string> = {
  H: '宇宙中含量最多、也是最輕的元素。氫氣燃燒只生成水，是潔淨燃料。',
  He: '比空氣輕又不可燃，用來填充氣球與飛船。',
  Li: '最輕的金屬，手機與電動車的鋰電池都靠它。',
  C: '鑽石、石墨都是由碳組成；也是所有有機物的骨架。',
  N: '約占空氣體積的 78%，性質穩定，常用於食品包裝防腐。',
  O: '約占空氣體積的 21%，能幫助燃燒，生物呼吸需要它。',
  F: '最活潑的非金屬；牙膏中的氟化物可以預防蛀牙。',
  Ne: '通電時發出橘紅色光，用於霓虹燈。',
  Na: '非常活潑，遇水劇烈反應，實驗室把它保存在煤油中。',
  Mg: '燃燒時發出強烈白光，以前用於照相閃光燈。',
  Al: '地殼中含量最多的金屬，表面的氧化鋁薄膜能保護內部不再生鏽。',
  Si: '地殼中含量第二多的元素，是電腦晶片的半導體材料。',
  P: '火柴盒側邊塗有紅磷；白磷在空氣中會自燃，須保存在水中。',
  S: '黃色固體，燃燒產生有刺激性臭味的二氧化硫。',
  Cl: '黃綠色有毒氣體，可用於自來水消毒與製造漂白水。',
  Ar: '空氣中含量最多的鈍氣（約 0.93%），用於填充燈泡。',
  K: '植物生長需要的三要素之一，常見於鉀肥。',
  Ca: '骨骼、牙齒、蛋殼與大理石中都含有鈣。',
  Ti: '輕、強度高又耐腐蝕，用於人工關節與飛機零件。',
  Mn: '二氧化錳是雙氧水分解製氧的催化劑。',
  Fe: '人類使用量最多的金屬；潮濕空氣中容易生鏽。',
  Cu: '導電性佳又便宜，電線多用銅製成；生鏽後會產生綠色的銅綠。',
  Zn: '鍍在鐵上防鏽（鍍鋅鐵）；也是乾電池的負極材料。',
  Br: '常溫下唯一呈液態的非金屬，紅棕色、易揮發。',
  Ag: '所有金屬中導電、導熱性最好的。',
  Sn: '熔點低，常用於焊錫；鍍錫的鐵罐稱為馬口鐵。',
  I: '紫黑色固體，加熱會昇華；碘液可以檢驗澱粉（變藍黑色）。',
  Ba: '硫酸鋇不溶於水與胃酸，用作腸胃 X 光攝影的「鋇劑」。',
  W: '熔點最高的金屬，以前用來做燈泡的燈絲。',
  Pt: '俗稱白金，化學性質穩定，也是汽車觸媒轉化器的催化劑。',
  Au: '延展性最好的金屬，1 克黃金可以拉成約 3 公里長的細絲。',
  Hg: '常溫下唯一呈液態的金屬，蒸氣有毒。',
  Pb: '密度大、有毒；汽車的鉛蓄電池使用鉛。',
  U: '核能發電的燃料，鈾-235 分裂時放出大量能量。',
}

const JUNIOR_HIGH_EXTRA = new Set(['Mn', 'Fe', 'Cu', 'Zn', 'Br', 'Ag', 'Sn', 'I', 'Ba', 'Pt', 'Au', 'Hg', 'Pb'])

const GASES = new Set(['H', 'He', 'N', 'O', 'F', 'Ne', 'Cl', 'Ar', 'Kr', 'Xe', 'Rn'])
const LIQUIDS = new Set(['Br', 'Hg'])
const METALLOIDS = new Set(['B', 'Si', 'Ge', 'As', 'Sb', 'Te'])
const NONMETALS = new Set(['H', 'C', 'N', 'O', 'P', 'S', 'Se'])
const HALOGENS = new Set(['F', 'Cl', 'Br', 'I', 'At'])
const NOBLE = new Set(['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'])
const POST_TRANSITION = new Set(['Al', 'Ga', 'In', 'Sn', 'Tl', 'Pb', 'Bi', 'Po'])
/** 標準原子量表以方括號表示質量數的元素：無穩定同位素，且非 Th、Pa、U */
const hasNoStandardWeight = (z: number) => z === 43 || z === 61 || (z >= 84 && ![90, 91, 92].includes(z))

// ---- 位置 ----

const PERIOD_END = [2, 10, 18, 36, 54, 86, 118]

function periodOf(z: number): number {
  return PERIOD_END.findIndex((end) => z <= end) + 1
}

function groupOf(z: number): number | null {
  const period = periodOf(z)
  const start = period === 1 ? 1 : PERIOD_END[period - 2] + 1
  const pos = z - start // 0-based
  if (period === 1) return z === 1 ? 1 : 18
  if (period <= 3) return pos < 2 ? pos + 1 : pos + 11
  if (period <= 5) return pos + 1
  // 第 6、7 週期：第 3 個位置起 15 個是鑭系／錒系
  if (pos < 2) return pos + 1
  if (pos < 17) return null
  return pos - 13
}

function categoryOf(z: number, symbol: string, group: number | null): Category {
  if ((z >= 57 && z <= 71)) return 'lanthanide'
  if (z >= 89 && z <= 103) return 'actinide'
  if (z >= 109) return 'unknown'
  if (NOBLE.has(symbol)) return 'noble'
  if (HALOGENS.has(symbol)) return 'halogen'
  if (NONMETALS.has(symbol)) return 'nonmetal'
  if (METALLOIDS.has(symbol)) return 'metalloid'
  if (POST_TRANSITION.has(symbol)) return 'post-transition'
  if (group === 1) return 'alkali'
  if (group === 2) return 'alkaline'
  return 'transition'
}

// ---- 電子組態 ----

export const ORBITALS = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p']
const CAPACITY: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 }

/** 不依照填入順序（Madelung 規則）的例外，列出與規則不同的軌域 */
const EXCEPTIONS: Record<number, Record<string, number>> = {
  24: { '3d': 5, '4s': 1 }, // Cr
  29: { '3d': 10, '4s': 1 }, // Cu
  41: { '4d': 4, '5s': 1 }, // Nb
  42: { '4d': 5, '5s': 1 }, // Mo
  44: { '4d': 7, '5s': 1 }, // Ru
  45: { '4d': 8, '5s': 1 }, // Rh
  46: { '4d': 10, '5s': 0 }, // Pd
  47: { '4d': 10, '5s': 1 }, // Ag
  57: { '4f': 0, '5d': 1 }, // La
  58: { '4f': 1, '5d': 1 }, // Ce
  64: { '4f': 7, '5d': 1 }, // Gd
  78: { '5d': 9, '6s': 1 }, // Pt
  79: { '5d': 10, '6s': 1 }, // Au
  89: { '5f': 0, '6d': 1 }, // Ac
  90: { '5f': 0, '6d': 2 }, // Th
  91: { '5f': 2, '6d': 1 }, // Pa
  92: { '5f': 3, '6d': 1 }, // U
  93: { '5f': 4, '6d': 1 }, // Np
  96: { '5f': 7, '6d': 1 }, // Cm
  103: { '6d': 0, '7p': 1 }, // Lr
}

/** 只依填入順序規則（Madelung）填電子，不考慮例外 */
export function ruleFilling(z: number): Record<string, number> {
  const fill: Record<string, number> = {}
  let left = z
  for (const orb of ORBITALS) {
    if (left <= 0) break
    const n = Math.min(left, CAPACITY[orb[1]])
    fill[orb] = n
    left -= n
  }
  return fill
}

/** 實際的基態電子填入（含 Cr、Cu 等例外） */
export function orbitalFilling(z: number): Record<string, number> {
  return { ...ruleFilling(z), ...(EXCEPTIONS[z] ?? {}) }
}

export const hasConfigurationException = (z: number) => z in EXCEPTIONS

export interface SubshellBoxes {
  /** 例如 "3d" */
  name: string
  electrons: number
  /** 每個軌域的 [上旋, 下旋]；依洪德定則先各填一個上旋 */
  orbitals: [boolean, boolean][]
}

/** 軌域方格圖：依能量由低到高列出有電子（或已開始填）的副殼層 */
export function orbitalBoxes(z: number): SubshellBoxes[] {
  const fill = orbitalFilling(z)
  const lastIdx = Math.max(...Object.keys(fill).map((o) => ORBITALS.indexOf(o)))
  return ORBITALS.slice(0, lastIdx + 1).map((name) => {
    const e = fill[name] ?? 0
    const k = CAPACITY[name[1]] / 2
    return {
      name,
      electrons: e,
      orbitals: Array.from({ length: k }, (_, i) => [i < Math.min(e, k), i < e - k] as [boolean, boolean]),
    }
  })
}

/** 依規則會得到的組態（用來和實際組態比較） */
export function ruleConfiguration(z: number): string {
  return formatConfig(z, ruleFilling(z))
}

export function shellsOf(z: number): number[] {
  const shells: number[] = []
  for (const [orb, n] of Object.entries(orbitalFilling(z))) {
    const idx = parseInt(orb[0], 10) - 1
    shells[idx] = (shells[idx] ?? 0) + n
  }
  const result = Array.from(shells, (n) => n ?? 0)
  // 鈀的 5s 為 0，最外層不能是空的
  while (result.at(-1) === 0) result.pop()
  return result
}

const NOBLE_CORES: [number, string][] = [
  [86, 'Rn'],
  [54, 'Xe'],
  [36, 'Kr'],
  [18, 'Ar'],
  [10, 'Ne'],
  [2, 'He'],
]
const L_ORDER = 'spdf'

/** 例如 Fe → "[Ar] 3d6 4s2"（依主量子數排列，上標以數字表示） */
export function configurationOf(z: number): string {
  return formatConfig(z, orbitalFilling(z))
}

function formatConfig(z: number, fill: Record<string, number>): string {
  const core = NOBLE_CORES.find(([cz]) => cz < z)
  const coreFill = core ? orbitalFilling(core[0]) : {}
  const parts = Object.entries(fill)
    .map(([orb, n]) => [orb, n - (coreFill[orb] ?? 0)] as const)
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => a[0].localeCompare(b[0]) || L_ORDER.indexOf(a[1]) - L_ORDER.indexOf(b[1]))
    .map(([orb, n]) => `${orb}${n}`)
  return [core ? `[${core[1]}]` : '', ...parts].filter(Boolean).join(' ')
}

// ---- 組合 ----

export const PERIODIC_TABLE: PeriodicElement[] = RAW.map(([symbol, nameZh, nameEn, mass], i) => {
  const z = i + 1
  const group = groupOf(z)
  return {
    z,
    symbol,
    nameZh,
    nameEn,
    mass,
    massIsMassNumber: hasNoStandardWeight(z),
    period: periodOf(z),
    group,
    category: categoryOf(z, symbol, group),
    state: z >= 100 ? 'unknown' : GASES.has(symbol) ? 'gas' : LIQUIDS.has(symbol) ? 'liquid' : 'solid',
    shells: shellsOf(z),
    configuration: configurationOf(z),
    juniorHigh: z <= 20 || JUNIOR_HIGH_EXTRA.has(symbol),
    note: NOTES[symbol],
  }
})

export function metalClass(category: Category): MetalClass {
  if (category === 'metalloid') return 'metalloid'
  if (category === 'nonmetal' || category === 'halogen' || category === 'noble') return 'nonmetal'
  if (category === 'unknown') return 'unknown'
  return 'metal'
}

/** 在表格格線中的位置（1-based）：主表 7 列，空一列後放鑭系、錒系 */
export function gridPosition(el: PeriodicElement): { row: number; col: number } {
  if (el.group !== null) return { row: el.period, col: el.group }
  const offset = el.category === 'lanthanide' ? el.z - 57 : el.z - 89
  return { row: el.category === 'lanthanide' ? 9 : 10, col: offset + 3 }
}

export const CATEGORY_LABEL: Record<Category, string> = {
  alkali: '鹼金屬',
  alkaline: '鹼土金屬',
  transition: '過渡金屬',
  'post-transition': '其他金屬',
  metalloid: '類金屬',
  nonmetal: '非金屬',
  halogen: '鹵素',
  noble: '鈍氣（惰性氣體）',
  lanthanide: '鑭系元素',
  actinide: '錒系元素',
  unknown: '性質未確定',
}

export const METAL_LABEL: Record<MetalClass, string> = {
  metal: '金屬',
  metalloid: '類金屬',
  nonmetal: '非金屬',
  unknown: '未確定',
}

export const STATE_LABEL: Record<State, string> = {
  solid: '固態',
  liquid: '液態',
  gas: '氣態',
  unknown: '未知',
}

export const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q']
