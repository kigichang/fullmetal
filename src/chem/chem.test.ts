import { describe, expect, it } from 'vitest'
import { indicatorColor, INDICATORS, neutralizationPh } from './acidBase'
import { atomLedger, hintElement, isBalanced, isSimplest, sideMasses } from './balance'
import { REACTIONS } from './equations'
import { molarMass, molarMassSteps, parseFormula } from './formula'
import { ANIONS, CATIONS, compoundFormula, evaluate } from './precipitation'
import { solveLimiting, toMoles } from './stoichiometry'

const reaction = (id: string) => REACTIONS.find((r) => r.id === id)!
const ion = (list: typeof CATIONS, id: string) => list.find((i) => i.id === id)!

describe('formula', () => {
  it('parses parentheses', () => {
    expect(parseFormula('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 })
    expect(parseFormula('(NH4)2SO4')).toEqual({ N: 2, H: 8, S: 1, O: 4 })
  })
  it('computes molar mass', () => {
    expect(molarMass('Ca(OH)2')).toBe(74)
    expect(molarMass('H2O')).toBe(18)
    expect(molarMass('CaCl2')).toBe(111)
    expect(molarMassSteps('CH4')).toBe('12 + 4×1 = 16')
  })
  it('rejects bad input', () => {
    expect(() => parseFormula('Xx2')).toThrow()
    expect(() => parseFormula('Ca(OH2')).toThrow()
  })
})

describe('balance', () => {
  it('every reaction answer is balanced and simplest', () => {
    for (const r of REACTIONS) {
      expect(isBalanced(r, r.coefficients), r.id).toBe(true)
      expect(isSimplest(r.coefficients), r.id).toBe(true)
      const m = sideMasses(r, r.coefficients)
      expect(m.left, r.id).toBeCloseTo(m.right, 5)
    }
  })
  it('detects unbalanced and gives a hint', () => {
    const r = reaction('water')
    expect(isBalanced(r, [1, 1, 1])).toBe(false)
    expect(atomLedger(r, [1, 1, 1])).toEqual([
      { element: 'H', left: 2, right: 2 },
      { element: 'O', left: 2, right: 1 },
    ])
    expect(hintElement(r, [1, 1, 1])?.element).toBe('O')
    expect(isSimplest([4, 2, 4])).toBe(false)
  })
})

describe('stoichiometry', () => {
  it('4 g H2 + 16 g O2', () => {
    const r = reaction('water')
    const res = solveLimiting(r, [toMoles(4, 'g', 'H2'), toMoles(16, 'g', 'O2')])
    expect(res.limitingIndex).toBe(1)
    expect(res.extent).toBeCloseTo(0.5)
    const [h2, o2, h2o] = res.rows
    expect(h2.final).toBeCloseTo(1) // 剩 2 g
    expect(o2.final).toBe(0)
    expect(h2o.final * molarMass('H2O')).toBeCloseTo(18)
  })
  it('exact ratio uses up both', () => {
    const res = solveLimiting(reaction('ammonia'), [1, 3])
    expect(res.limitingIndex).toBeNull()
    expect(res.rows[2].final).toBeCloseTo(2)
  })
  it('particles unit', () => {
    expect(toMoles(12, 'particles', 'H2')).toBe(2)
  })
})

describe('acid-base', () => {
  it('neutralization pH', () => {
    expect(neutralizationPh(0.1, 20, 0.1, 0)).toBeCloseTo(1, 5)
    expect(neutralizationPh(0.1, 20, 0.1, 10)).toBeCloseTo(1.477, 2)
    expect(neutralizationPh(0.1, 20, 0.1, 20)).toBe(7)
    expect(neutralizationPh(0.1, 20, 0.1, 30)).toBeCloseTo(12.3, 2)
  })
  it('indicator interpolation', () => {
    const btb = INDICATORS.find((i) => i.id === 'btb')!
    expect(indicatorColor(2, btb)).toEqual(btb.stops[0].color)
    expect(indicatorColor(6.8, btb)).toEqual(btb.stops[1].color)
    expect(indicatorColor(12, btb)).toEqual(btb.stops[2].color)
  })
})

describe('precipitation', () => {
  it('builds formulas from charges', () => {
    expect(compoundFormula(ion(CATIONS, 'Fe3+'), ion(ANIONS, 'OH-')).formula).toBe('Fe(OH)3')
    expect(compoundFormula(ion(CATIONS, 'NH4+'), ion(ANIONS, 'S2-')).formula).toBe('(NH4)2S')
    expect(compoundFormula(ion(CATIONS, 'Fe3+'), ion(ANIONS, 'SO4 2-')).formula).toBe('Fe2(SO4)3')
    expect(compoundFormula(ion(CATIONS, 'Ba2+'), ion(ANIONS, 'SO4 2-')).formula).toBe('BaSO4')
  })
  it('evaluates table and fallback', () => {
    const agcl = evaluate(ion(CATIONS, 'Ag+'), ion(ANIONS, 'Cl-'))
    expect(agcl.outcome).toBe('precipitate')
    expect(agcl.netIonic).toBe('Ag^+ + Cl^- -> AgCl↓')
    expect(agcl.fullEquation).toBe('AgNO3 + NaCl -> AgCl↓ + NaNO3')
    const feoh = evaluate(ion(CATIONS, 'Fe3+'), ion(ANIONS, 'OH-'))
    expect(feoh.fullEquation).toBe('Fe(NO3)3 + 3NaOH -> Fe(OH)3↓ + 3NaNO3')
    const pbi = evaluate(ion(CATIONS, 'Pb2+'), ion(ANIONS, 'I-'))
    expect(pbi.fullEquation).toBe('Pb(NO3)2 + 2NaI -> PbI2↓ + 2NaNO3')
    expect(evaluate(ion(CATIONS, 'Na+'), ion(ANIONS, 'Cl-')).outcome).toBe('soluble')
    expect(evaluate(ion(CATIONS, 'Ag+'), ion(ANIONS, 'OH-')).formula).toBe('Ag2O')
  })
})
