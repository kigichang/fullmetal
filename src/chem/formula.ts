import { getElement } from './elements'

export type AtomCounts = Record<string, number>

/** 解析化學式（支援括號），例如 Ca(OH)2 → { Ca: 1, O: 2, H: 2 }。元素順序依首次出現。 */
export function parseFormula(formula: string): AtomCounts {
  let i = 0

  const readNumber = (): number => {
    let digits = ''
    while (i < formula.length && /\d/.test(formula[i])) digits += formula[i++]
    return digits ? parseInt(digits, 10) : 1
  }

  const parseGroup = (): AtomCounts => {
    const counts: AtomCounts = {}
    const add = (el: string, n: number) => {
      counts[el] = (counts[el] ?? 0) + n
    }
    while (i < formula.length) {
      const ch = formula[i]
      if (ch === '(') {
        i++
        const inner = parseGroup()
        if (formula[i] !== ')') throw new Error(`括號不成對：${formula}`)
        i++
        const mult = readNumber()
        for (const [el, n] of Object.entries(inner)) add(el, n * mult)
      } else if (ch === ')') {
        break
      } else if (/[A-Z]/.test(ch)) {
        let sym = ch
        i++
        while (i < formula.length && /[a-z]/.test(formula[i])) sym += formula[i++]
        getElement(sym)
        add(sym, readNumber())
      } else {
        throw new Error(`無法解析的化學式：${formula}`)
      }
    }
    return counts
  }

  const result = parseGroup()
  if (i !== formula.length) throw new Error(`括號不成對：${formula}`)
  return result
}

/** 分子量（式量），四捨五入到小數一位避免浮點誤差 */
export function molarMass(formula: string): number {
  const total = Object.entries(parseFormula(formula)).reduce(
    (sum, [el, n]) => sum + getElement(el).mass * n,
    0,
  )
  return Math.round(total * 10) / 10
}

/** 分子量的計算過程，例如 CH4 → "12 + 4×1 = 16" */
export function molarMassSteps(formula: string): string {
  const parts = Object.entries(parseFormula(formula)).map(([el, n]) => {
    const m = getElement(el).mass
    return n === 1 ? `${m}` : `${n}×${m}`
  })
  const total = molarMass(formula)
  return parts.length === 1 && !parts[0].includes('×') ? `${total}` : `${parts.join(' + ')} = ${total}`
}

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}
