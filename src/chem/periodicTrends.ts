import { PERIODIC_TABLE, type PeriodicElement } from './periodicTable'

export type TrendProperty = 'radius' | 'ie' | 'en'

export interface TrendValues {
  /** 共價半徑（pm，Cordero 2008）；鈍氣不列入 */
  radius?: number
  /** 第一游離能（kJ/mol） */
  ie: number
  /** 鮑林電負度；鈍氣不列入 */
  en?: number
}

/** 主族元素（第 1–6 週期、第 1、2、13–18 族）的週期性質 */
export const TRENDS: Record<string, TrendValues> = {
  H: { radius: 31, ie: 1312, en: 2.2 },
  He: { ie: 2372 },
  Li: { radius: 128, ie: 520, en: 0.98 },
  Be: { radius: 96, ie: 900, en: 1.57 },
  B: { radius: 84, ie: 801, en: 2.04 },
  C: { radius: 76, ie: 1086, en: 2.55 },
  N: { radius: 71, ie: 1402, en: 3.04 },
  O: { radius: 66, ie: 1314, en: 3.44 },
  F: { radius: 57, ie: 1681, en: 3.98 },
  Ne: { ie: 2081 },
  Na: { radius: 166, ie: 496, en: 0.93 },
  Mg: { radius: 141, ie: 738, en: 1.31 },
  Al: { radius: 121, ie: 578, en: 1.61 },
  Si: { radius: 111, ie: 787, en: 1.9 },
  P: { radius: 107, ie: 1012, en: 2.19 },
  S: { radius: 105, ie: 1000, en: 2.58 },
  Cl: { radius: 102, ie: 1251, en: 3.16 },
  Ar: { ie: 1521 },
  K: { radius: 203, ie: 419, en: 0.82 },
  Ca: { radius: 176, ie: 590, en: 1.0 },
  Ga: { radius: 122, ie: 579, en: 1.81 },
  Ge: { radius: 120, ie: 762, en: 2.01 },
  As: { radius: 119, ie: 947, en: 2.18 },
  Se: { radius: 120, ie: 941, en: 2.55 },
  Br: { radius: 120, ie: 1140, en: 2.96 },
  Kr: { ie: 1351 },
  Rb: { radius: 220, ie: 403, en: 0.82 },
  Sr: { radius: 195, ie: 550, en: 0.95 },
  In: { radius: 142, ie: 558, en: 1.78 },
  Sn: { radius: 139, ie: 709, en: 1.96 },
  Sb: { radius: 139, ie: 834, en: 2.05 },
  Te: { radius: 138, ie: 869, en: 2.1 },
  I: { radius: 139, ie: 1008, en: 2.66 },
  Xe: { ie: 1170 },
  Cs: { radius: 244, ie: 376, en: 0.79 },
  Ba: { radius: 215, ie: 503, en: 0.89 },
  Tl: { radius: 145, ie: 589, en: 1.62 },
  Pb: { radius: 146, ie: 716, en: 2.33 },
  Bi: { radius: 148, ie: 703, en: 2.02 },
  Po: { radius: 140, ie: 812, en: 2.0 },
  At: { radius: 150, ie: 899, en: 2.2 },
  Rn: { ie: 1037 },
}

export const PROPERTY_INFO: Record<TrendProperty, { nameZh: string; unit: string; digits: number; note: string }> = {
  radius: { nameZh: '原子半徑', unit: 'pm', digits: 0, note: '共價半徑；鈍氣很難形成共價鍵，半徑的定義不同，不列入比較。' },
  ie: { nameZh: '第一游離能', unit: 'kJ/mol', digits: 0, note: '從氣態原子移去一個電子所需的能量，越大表示越不容易失去電子。' },
  en: { nameZh: '電負度', unit: '', digits: 2, note: '鮑林電負度：原子在化合物中吸引共用電子的能力；鈍氣一般不列。' },
}

export function trendValue(symbol: string, prop: TrendProperty): number | undefined {
  return TRENDS[symbol]?.[prop]
}

/** 主族元素，依原子序排列 */
export const MAIN_GROUP: PeriodicElement[] = PERIODIC_TABLE.filter((e) => e.symbol in TRENDS)

/** 主族元素的壓縮版位置：第 1、2 族為第 0、1 欄，第 13–18 族為第 2–7 欄 */
export function mainGroupColumn(el: PeriodicElement): number {
  if (el.group === null) throw new Error(`${el.symbol} 不是主族元素`)
  return el.group <= 2 ? el.group - 1 : el.group - 11
}

export const MAIN_GROUP_LABELS = ['1', '2', '13', '14', '15', '16', '17', '18']

export type Direction = 'increase' | 'decrease'

/** 教科書的大致趨勢（有例外）：同週期由左到右、同族由上到下 */
export const EXPECTED_TREND: Record<TrendProperty, { across: Direction; down: Direction }> = {
  radius: { across: 'decrease', down: 'increase' },
  ie: { across: 'increase', down: 'decrease' },
  en: { across: 'increase', down: 'decrease' },
}
