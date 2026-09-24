import { gcd } from './formula'

export interface Ion {
  id: string
  /** 不含電荷的化學式，例如 SO4 */
  formula: string
  charge: number
  nameZh: string
  /** 多原子離子組成化合物時需要加括號 */
  polyatomic?: boolean
  /** 水溶液顏色（無色離子不設定） */
  solutionColor?: string
  solutionColorName?: string
}

export const CATIONS: Ion[] = [
  { id: 'Na+', formula: 'Na', charge: 1, nameZh: '鈉離子' },
  { id: 'K+', formula: 'K', charge: 1, nameZh: '鉀離子' },
  { id: 'NH4+', formula: 'NH4', charge: 1, nameZh: '銨根離子', polyatomic: true },
  { id: 'Ag+', formula: 'Ag', charge: 1, nameZh: '銀離子' },
  { id: 'Ca2+', formula: 'Ca', charge: 2, nameZh: '鈣離子' },
  { id: 'Ba2+', formula: 'Ba', charge: 2, nameZh: '鋇離子' },
  { id: 'Cu2+', formula: 'Cu', charge: 2, nameZh: '銅離子', solutionColor: 'rgba(59, 130, 246, 0.55)', solutionColorName: '藍色' },
  { id: 'Fe3+', formula: 'Fe', charge: 3, nameZh: '鐵離子', solutionColor: 'rgba(217, 160, 40, 0.55)', solutionColorName: '黃褐色' },
  { id: 'Pb2+', formula: 'Pb', charge: 2, nameZh: '鉛離子' },
  { id: 'Zn2+', formula: 'Zn', charge: 2, nameZh: '鋅離子' },
]

export const ANIONS: Ion[] = [
  { id: 'NO3-', formula: 'NO3', charge: -1, nameZh: '硝酸根', polyatomic: true },
  { id: 'Cl-', formula: 'Cl', charge: -1, nameZh: '氯離子' },
  { id: 'I-', formula: 'I', charge: -1, nameZh: '碘離子' },
  { id: 'SO4 2-', formula: 'SO4', charge: -2, nameZh: '硫酸根', polyatomic: true },
  { id: 'CO3 2-', formula: 'CO3', charge: -2, nameZh: '碳酸根', polyatomic: true },
  { id: 'OH-', formula: 'OH', charge: -1, nameZh: '氫氧根', polyatomic: true },
  { id: 'S2-', formula: 'S', charge: -2, nameZh: '硫離子' },
]

/** 離子的 Chem 字串，例如 SO4^2- */
export function ionChem(ion: Ion): string {
  const mag = Math.abs(ion.charge)
  return `${ion.formula}^${mag === 1 ? '' : mag}${ion.charge > 0 ? '+' : '-'}`
}

/** 依電荷自動配出最簡化學式，例如 Fe³⁺ + OH⁻ → Fe(OH)3 */
export function compoundFormula(cation: Ion, anion: Ion) {
  const a = Math.abs(cation.charge)
  const b = Math.abs(anion.charge)
  const g = gcd(a, b)
  const cationCount = b / g
  const anionCount = a / g
  const part = (ion: Ion, n: number) =>
    n === 1 ? ion.formula : ion.polyatomic ? `(${ion.formula})${n}` : `${ion.formula}${n}`
  return { formula: part(cation, cationCount) + part(anion, anionCount), cationCount, anionCount }
}

export type Outcome = 'precipitate' | 'slight' | 'soluble' | 'special'

interface Entry {
  outcome: Outcome
  nameZh?: string
  colorName?: string
  color?: string
  /** 產物化學式與配比公式不同時覆寫（例如 Ag2O） */
  formula?: string
  /** 無法用一般配比表示的反應，直接給淨離子反應式（Chem 字串） */
  netIonic?: string
  /** 反應後溶液顏色（覆寫） */
  solutionColor?: string
  note?: string
}

export interface PrecipitationResult extends Omit<Entry, 'netIonic'> {
  cation: Ion
  anion: Ion
  formula: string
  /** 淨離子反應式（Chem 字串）；可溶且無反應時為 null */
  netIonic: string | null
  /** 以硝酸鹽、鈉鹽溶液混合時的完整反應式（Chem 字串） */
  fullEquation: string | null
}

const WHITE = '#f8fafc'
const E = (outcome: Outcome, rest: Omit<Entry, 'outcome'> = {}): Entry => ({ outcome, ...rest })

/** 只列出會沉澱、微溶或有特殊現象的組合，其餘皆可溶 */
const TABLE: Record<string, Entry> = {
  'NH4+|OH-': E('special', { note: '生成氨（NH₃）與水，不會沉澱；加熱時可聞到刺激性的氨味。', netIonic: 'NH4^+ + OH^- -> NH3↑ + H2O' }),

  'Ag+|Cl-': E('precipitate', { nameZh: '氯化銀', colorName: '白色', color: WHITE, note: '檢驗氯離子的常用方法；照光後會逐漸變成灰紫色。' }),
  'Ag+|I-': E('precipitate', { nameZh: '碘化銀', colorName: '黃色', color: '#fde68a', note: '碘化銀可用於人造雨（雲種）。' }),
  'Ag+|SO4 2-': E('slight', { nameZh: '硫酸銀', colorName: '白色', color: WHITE, note: '硫酸銀微溶於水，濃度大時才會看到少量白色沉澱。' }),
  'Ag+|CO3 2-': E('precipitate', { nameZh: '碳酸銀', colorName: '淡黃色', color: '#fef3c7' }),
  'Ag+|OH-': E('precipitate', { nameZh: '氧化銀', colorName: '褐色', color: '#78350f', formula: 'Ag2O', netIonic: '2Ag^+ + 2OH^- -> Ag2O↓ + H2O', note: '氫氧化銀不穩定，會立刻分解成褐色的氧化銀。' }),
  'Ag+|S2-': E('precipitate', { nameZh: '硫化銀', colorName: '黑色', color: '#1c1917', note: '銀器變黑就是表面生成了硫化銀。' }),

  'Ca2+|SO4 2-': E('slight', { nameZh: '硫酸鈣', colorName: '白色', color: WHITE, note: '硫酸鈣微溶，是石膏的主要成分。' }),
  'Ca2+|CO3 2-': E('precipitate', { nameZh: '碳酸鈣', colorName: '白色', color: WHITE, note: '二氧化碳使澄清石灰水變混濁，就是生成了碳酸鈣；大理石、蛋殼的主要成分。' }),
  'Ca2+|OH-': E('slight', { nameZh: '氫氧化鈣', colorName: '白色', color: WHITE, note: '氫氧化鈣微溶，它的澄清水溶液就是「石灰水」。' }),

  'Ba2+|SO4 2-': E('precipitate', { nameZh: '硫酸鋇', colorName: '白色', color: WHITE, note: '不溶於酸，醫院腸胃 X 光攝影用的「鋇劑」。' }),
  'Ba2+|CO3 2-': E('precipitate', { nameZh: '碳酸鋇', colorName: '白色', color: WHITE, note: '碳酸鋇可溶於鹽酸並產生氣泡，硫酸鋇則不會，可以用來區分兩者。' }),

  'Cu2+|I-': E('special', { nameZh: '碘化亞銅', colorName: '白色沉澱＋褐色溶液', color: '#e7e5e4', formula: 'CuI', netIonic: '2Cu^2+ + 4I^- -> 2CuI↓ + I2', solutionColor: 'rgba(146, 64, 14, 0.5)', note: '同時發生氧化還原，生成的碘使溶液呈褐色（高中才會詳細學）。' }),
  'Cu2+|CO3 2-': E('precipitate', { nameZh: '碳酸銅', colorName: '藍綠色', color: '#5eead4', note: '實際生成的是鹼式碳酸銅，和銅綠（銅鏽）成分相近。' }),
  'Cu2+|OH-': E('precipitate', { nameZh: '氫氧化銅', colorName: '藍色', color: '#60a5fa', note: '藍色膠狀沉澱，加熱會變成黑色的氧化銅。' }),
  'Cu2+|S2-': E('precipitate', { nameZh: '硫化銅', colorName: '黑色', color: '#1c1917' }),

  'Fe3+|I-': E('special', { nameZh: '（無沉澱）', colorName: '褐色溶液', formula: '—', netIonic: '2Fe^3+ + 2I^- -> 2Fe^2+ + I2', solutionColor: 'rgba(146, 64, 14, 0.55)', note: '鐵離子把碘離子氧化成碘，溶液變褐色，但沒有沉澱。' }),
  'Fe3+|CO3 2-': E('special', { nameZh: '氫氧化鐵', colorName: '紅褐色＋氣泡', color: '#9a3412', formula: 'Fe(OH)3', netIonic: '2Fe^3+ + 3CO3^2- + 3H2O -> 2Fe(OH)3↓ + 3CO2↑', note: '碳酸鐵不存在，會生成紅褐色氫氧化鐵並放出二氧化碳氣泡。' }),
  'Fe3+|OH-': E('precipitate', { nameZh: '氫氧化鐵', colorName: '紅褐色', color: '#9a3412', note: '紅褐色膠狀沉澱，是檢驗鐵離子的方法之一。' }),
  'Fe3+|S2-': E('special', { nameZh: '硫化亞鐵＋硫', colorName: '黑色', color: '#1c1917', formula: 'FeS', netIonic: '2Fe^3+ + 3S^2- -> 2FeS↓ + S↓', note: '同時發生氧化還原，生成黑色沉澱與硫。' }),

  'Pb2+|Cl-': E('precipitate', { nameZh: '氯化鉛', colorName: '白色', color: WHITE, note: '氯化鉛在熱水中溶解度變大，冷卻又會析出。' }),
  'Pb2+|I-': E('precipitate', { nameZh: '碘化鉛', colorName: '黃色', color: '#facc15', note: '鮮黃色沉澱；熱水溶解後冷卻會析出金黃色亮片，稱為「黃金雨」實驗。' }),
  'Pb2+|SO4 2-': E('precipitate', { nameZh: '硫酸鉛', colorName: '白色', color: WHITE }),
  'Pb2+|CO3 2-': E('precipitate', { nameZh: '碳酸鉛', colorName: '白色', color: WHITE }),
  'Pb2+|OH-': E('precipitate', { nameZh: '氫氧化鉛', colorName: '白色', color: WHITE }),
  'Pb2+|S2-': E('precipitate', { nameZh: '硫化鉛', colorName: '黑色', color: '#1c1917' }),

  'Zn2+|CO3 2-': E('precipitate', { nameZh: '碳酸鋅', colorName: '白色', color: WHITE }),
  'Zn2+|OH-': E('precipitate', { nameZh: '氫氧化鋅', colorName: '白色', color: WHITE, note: '氫氧化鈉加太多時，沉澱會再溶解。' }),
  'Zn2+|S2-': E('precipitate', { nameZh: '硫化鋅', colorName: '白色', color: WHITE, note: '硫化物大多是黑色，硫化鋅是少數的白色硫化物。' }),
}

/** 化學式的係數字串（1 不寫） */
const co = (n: number) => (n === 1 ? '' : String(n))

export function evaluate(cation: Ion, anion: Ion): PrecipitationResult {
  const entry = TABLE[`${cation.id}|${anion.id}`] ?? E('soluble')
  const { formula, cationCount, anionCount } = compoundFormula(cation, anion)
  const product = entry.formula ?? formula

  let netIonic: string | null = entry.netIonic ?? null
  let fullEquation: string | null = null

  if (!entry.netIonic && (entry.outcome === 'precipitate' || entry.outcome === 'slight')) {
    netIonic = `${co(cationCount)}${ionChem(cation)} + ${co(anionCount)}${ionChem(anion)} -> ${product}↓`
    // 陽離子取自硝酸鹽 M(NO3)a、陰離子取自鈉鹽 NabX
    const nitrate = compoundFormula(cation, ANIONS[0]).formula
    const sodium = compoundFormula(CATIONS[0], anion).formula
    fullEquation = `${co(cationCount)}${nitrate} + ${co(anionCount)}${sodium} -> ${product}↓ + ${co(cationCount * cation.charge)}NaNO3`
  }

  return { ...entry, cation, anion, formula: product, netIonic, fullEquation }
}
