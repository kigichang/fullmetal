const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

/** 科學記號，例如 0.000018 → "1.8×10⁻⁵" */
export function sci(n: number, digits = 2): string {
  const [mant, exp] = n.toExponential(digits).split('e')
  const e = String(parseInt(exp, 10))
  return `${parseFloat(mant)}×10${[...e].map((c) => SUP[c]).join('')}`
}
