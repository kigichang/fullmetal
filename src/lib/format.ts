const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

/** 科學記號，例如 0.000018 → "1.8×10⁻⁵" */
export function sci(n: number, digits = 2): string {
  const [mant, exp] = n.toExponential(digits).split('e')
  const e = String(parseInt(exp, 10))
  return `${parseFloat(mant)}×10${[...e].map((c) => SUP[c]).join('')}`
}

const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' }
const SUP_CHARGE: Record<string, string> = { ...SUP, '+': '⁺' }

/** Chem 字串轉成純 Unicode（給 SVG 文字用），例如 "Fe^3+" → "Fe³⁺"、"N2O4" → "N₂O₄" */
export function chemUnicode(s: string): string {
  const [body, charge] = s.split('^')
  const main = body.replace(/([A-Za-z)])(\d+)/g, (_, a: string, d: string) => a + [...d].map((c) => SUB[c]).join(''))
  return charge ? main + [...charge].map((c) => SUP_CHARGE[c] ?? c).join('') : main
}
