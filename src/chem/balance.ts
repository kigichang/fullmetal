import type { Reaction } from './equations'
import { gcd, molarMass, parseFormula, type AtomCounts } from './formula'

export interface LedgerRow {
  element: string
  left: number
  right: number
}

function countSide(formulas: string[], coeffs: number[]): AtomCounts {
  const counts: AtomCounts = {}
  formulas.forEach((f, idx) => {
    for (const [el, n] of Object.entries(parseFormula(f))) {
      counts[el] = (counts[el] ?? 0) + n * coeffs[idx]
    }
  })
  return counts
}

/** 原子帳本：每種元素在反應物、生成物兩側的原子總數 */
export function atomLedger(reaction: Reaction, coeffs: number[]): LedgerRow[] {
  const n = reaction.reactants.length
  const left = countSide(reaction.reactants, coeffs.slice(0, n))
  const right = countSide(reaction.products, coeffs.slice(n))
  const elements = [...new Set([...Object.keys(left), ...Object.keys(right)])]
  return elements.map((element) => ({ element, left: left[element] ?? 0, right: right[element] ?? 0 }))
}

export function isBalanced(reaction: Reaction, coeffs: number[]): boolean {
  return atomLedger(reaction, coeffs).every((r) => r.left === r.right)
}

export function isSimplest(coeffs: number[]): boolean {
  return coeffs.reduce((g, c) => gcd(g, c), 0) === 1
}

/** 兩側總質量（係數 × 分子量 的總和） */
export function sideMasses(reaction: Reaction, coeffs: number[]): { left: number; right: number } {
  const n = reaction.reactants.length
  const sum = (formulas: string[], cs: number[]) =>
    Math.round(formulas.reduce((s, f, i) => s + molarMass(f) * cs[i], 0) * 10) / 10
  return {
    left: sum(reaction.reactants, coeffs.slice(0, n)),
    right: sum(reaction.products, coeffs.slice(n)),
  }
}

/** 提示：差距最大的元素（平衡時回傳 null） */
export function hintElement(reaction: Reaction, coeffs: number[]): LedgerRow | null {
  const off = atomLedger(reaction, coeffs).filter((r) => r.left !== r.right)
  if (off.length === 0) return null
  return off.reduce((a, b) => (Math.abs(b.left - b.right) > Math.abs(a.left - a.right) ? b : a))
}
