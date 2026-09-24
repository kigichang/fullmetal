import type { Reaction } from './equations'
import { molarMass } from './formula'

export type AmountUnit = 'g' | 'mol' | 'particles'

/** 1 莫耳 = 6×10²³ 個粒子（國中課本取 6） */
export const AVOGADRO_COEF = 6

export const UNIT_LABEL: Record<AmountUnit, string> = {
  g: '克 (g)',
  mol: '莫耳 (mol)',
  particles: '×10²³ 個',
}

export function toMoles(amount: number, unit: AmountUnit, formula: string): number {
  if (unit === 'g') return amount / molarMass(formula)
  if (unit === 'particles') return amount / AVOGADRO_COEF
  return amount
}

export interface SpeciesRow {
  formula: string
  role: 'reactant' | 'product'
  coef: number
  initial: number
  change: number
  final: number
}

export interface LimitingResult {
  /** 每個反應物的 莫耳數 ÷ 係數 */
  ratios: number[]
  /** 限量試劑的索引；兩者剛好用完時為 null */
  limitingIndex: number | null
  /** 反應進度 ξ（mol） */
  extent: number
  rows: SpeciesRow[]
}

const EPS = 1e-9

/** 只處理兩個反應物的反應 */
export function solveLimiting(reaction: Reaction, reactantMoles: [number, number]): LimitingResult {
  const nR = reaction.reactants.length
  if (nR !== 2) throw new Error('限量試劑計算需要兩個反應物')
  const coefs = reaction.coefficients
  const ratios = reactantMoles.map((n, i) => n / coefs[i])
  const extent = Math.min(...ratios)
  const limitingIndex = Math.abs(ratios[0] - ratios[1]) <= EPS * Math.max(1, extent) ? null : ratios[0] < ratios[1] ? 0 : 1

  const rows: SpeciesRow[] = [
    ...reaction.reactants.map((formula, i) => {
      const change = -coefs[i] * extent
      const final = i === limitingIndex || limitingIndex === null ? 0 : reactantMoles[i] + change
      return { formula, role: 'reactant' as const, coef: coefs[i], initial: reactantMoles[i], change, final }
    }),
    ...reaction.products.map((formula, j) => {
      const coef = coefs[nR + j]
      return { formula, role: 'product' as const, coef, initial: 0, change: coef * extent, final: coef * extent }
    }),
  ]
  return { ratios, limitingIndex, extent, rows }
}

/** 學生答案是否正確：相對誤差 1% 以內（接近 0 時用絕對誤差） */
export function isClose(answer: number, expected: number): boolean {
  if (!Number.isFinite(answer)) return false
  if (Math.abs(expected) < 1e-6) return Math.abs(answer) < 1e-3
  return Math.abs(answer - expected) / Math.abs(expected) <= 0.01
}

/** 顯示用數字：最多 3 位有效小數，去掉多餘的 0 */
export function fmt(n: number, digits = 3): string {
  if (Math.abs(n) < 1e-9) return '0'
  return parseFloat(n.toFixed(digits)).toString()
}
