import { describe, expect, it } from 'vitest'
import {
  applyPerturbation,
  EQ_SYSTEMS,
  initialState,
  kAt,
  reactionQuotient,
  relaxPath,
  shiftDirection,
  simulateDynamic,
  solveEquilibrium,
  type Perturbation,
} from './equilibrium'
import { analyzeRedox, displacement, galvanicCell, metalBySymbol, oxidationNumbers, REDOX_REACTIONS } from './redox'

const sys = (id: string) => EQ_SYSTEMS.find((s) => s.id === id)!
const rx = (id: string) => REDOX_REACTIONS.find((r) => r.id === id)!

describe('oxidation numbers', () => {
  it.each([
    ['O2', 'O', 0],
    ['Cu^2+', 'Cu', 2],
    ['H2O', 'O', -2],
    ['H2O2', 'O', -1],
    ['NaH', 'H', -1],
    ['CO2', 'C', 4],
    ['CO', 'C', 2],
    ['CH4', 'C', -4],
    ['NH3', 'N', -3],
    ['Fe2O3', 'Fe', 3],
    ['KMnO4', 'Mn', 7],
    ['MnO2', 'Mn', 4],
    ['Cr2O7^2-', 'Cr', 6],
    ['SO4^2-', 'S', 6],
    ['H2S', 'S', -2],
    ['NO3^-', 'N', 5],
    ['NaClO', 'Cl', 1],
    ['KI', 'I', -1],
    ['Cu2O', 'Cu', 1],
  ] as const)('%s: %s = %i', (species, el, n) => {
    expect(oxidationNumbers(species).numbers[el]).toBeCloseTo(n, 6)
  })

  it('explains each rule used', () => {
    const { steps } = oxidationNumbers('KMnO4')
    expect(steps.some((s) => s.includes('K 是第 1 族'))).toBe(true)
    expect(steps.at(-1)).toContain('Mn = +7')
  })
})

describe('redox analysis', () => {
  it('Zn + Cu2+: Zn oxidized, Cu2+ reduced, 2 electrons', () => {
    const a = analyzeRedox(rx('zn-cu'))
    expect(a.isRedox).toBe(true)
    expect(a.reducingAgents).toEqual(['Zn'])
    expect(a.oxidizingAgents).toEqual(['Cu^2+'])
    expect(a.electrons).toBe(2)
  })
  it('agents and electron counts for the other reactions', () => {
    expect(analyzeRedox(rx('blast'))).toMatchObject({ reducingAgents: ['CO'], oxidizingAgents: ['Fe2O3'], electrons: 6 })
    expect(analyzeRedox(rx('c-cuo'))).toMatchObject({ reducingAgents: ['C'], oxidizingAgents: ['CuO'], electrons: 4 })
    expect(analyzeRedox(rx('na-water'))).toMatchObject({ reducingAgents: ['Na'], oxidizingAgents: ['H2O'], electrons: 2 })
    const h2o2 = analyzeRedox(rx('h2o2'))
    expect(h2o2.elements.find((e) => e.element === 'O')!.change).toBe('both')
  })
  it('non-redox reactions', () => {
    expect(analyzeRedox(rx('neutral')).isRedox).toBe(false)
    expect(analyzeRedox(rx('caco3')).isRedox).toBe(false)
  })
  it('oxygen view agrees with oxidation numbers', () => {
    for (const r of REDOX_REACTIONS.filter((x) => x.oxygenView)) {
      const a = analyzeRedox(r)
      expect(a.reducingAgents, r.id).toContain(r.oxygenView!.gainsO)
      expect(a.oxidizingAgents, r.id).toContain(r.oxygenView!.losesO)
    }
  })
})

describe('activity and cells', () => {
  it('displacement follows the activity series', () => {
    const zn = metalBySymbol('Zn')
    const cu = metalBySymbol('Cu')
    const ag = metalBySymbol('Ag')
    expect(displacement(zn, cu).netIonic).toBe('Zn + Cu^2+ -> Zn^2+ + Cu')
    expect(displacement(cu, zn).reacts).toBe(false)
    expect(displacement(cu, ag).netIonic).toBe('Cu + 2Ag^+ -> Cu^2+ + 2Ag')
    expect(displacement(cu, cu).reacts).toBe(false)
  })
  it('Daniell cell is 1.10 V with zinc as the anode', () => {
    const cell = galvanicCell(metalBySymbol('Cu'), metalBySymbol('Zn'))!
    expect(cell.anode.symbol).toBe('Zn')
    expect(cell.voltage).toBeCloseTo(1.1, 2)
  })
})

describe('equilibrium', () => {
  const eq = (id: string) => solveEquilibrium(sys(id), initialState(sys(id)))

  it('solves N2O4 <=> 2NO2 (Kc 4.6e-3)', () => {
    const s = eq('no2')
    expect(s.n[1]).toBeCloseTo(0.0203, 3)
    expect(reactionQuotient(sys('no2'), s)).toBeCloseTo(4.6e-3, 6)
  })

  it('every system starts at Q = K', () => {
    for (const x of EQ_SYSTEMS) {
      const s = eq(x.id)
      expect(Math.log(reactionQuotient(x, s)), x.id).toBeCloseTo(Math.log(kAt(x, s.t)), 4)
    }
  })

  const shift = (id: string, p: Perturbation) => shiftDirection(sys(id), applyPerturbation(sys(id), eq(id), p))

  it.each([
    ['no2', { kind: 'heat' }, 'right'],
    ['no2', { kind: 'cool' }, 'left'],
    ['no2', { kind: 'compress' }, 'left'],
    ['no2', { kind: 'expand' }, 'right'],
    ['no2', { kind: 'add', formula: 'NO2' }, 'left'],
    ['no2', { kind: 'catalyst' }, 'none'],
    ['chromate', { kind: 'acid' }, 'right'],
    ['chromate', { kind: 'base' }, 'left'],
    ['fescn', { kind: 'add', formula: 'SCN^-' }, 'right'],
    ['fescn', { kind: 'dilute' }, 'left'],
    ['haber', { kind: 'compress' }, 'right'],
    ['haber', { kind: 'heat' }, 'left'],
    ['haber', { kind: 'remove', formula: 'NH3' }, 'right'],
    ['haber', { kind: 'catalyst' }, 'none'],
  ] as [string, Perturbation, string][])('%s %o shifts %s', (id, p, dir) => {
    expect(shift(id, p)).toBe(dir)
  })

  it('Le Chatelier only partly offsets an added product', () => {
    const x = sys('no2')
    const before = eq('no2')
    const perturbed = applyPerturbation(x, before, { kind: 'add', formula: 'NO2' })
    const after = solveEquilibrium(x, perturbed)
    expect(after.n[1]).toBeGreaterThan(before.n[1])
    expect(after.n[1]).toBeLessThan(perturbed.n[1])
  })

  it('relaxation path starts at the perturbed state and ends near equilibrium', () => {
    const path = relaxPath({ n: [1, 0], v: 1, t: 298, pH: 7 }, { n: [0.5, 1], v: 1, t: 298, pH: 7 }, 30)
    expect(path[0]).toEqual([1, 0])
    expect(path.at(-1)![1]).toBeCloseTo(1, 1)
  })
})

describe('dynamic equilibrium simulation', () => {
  it('reaches the same ratio from either side and keeps reacting', () => {
    const fromA = simulateDynamic(60, 60, 0.1, 0.05, 300, 1)
    const fromB = simulateDynamic(60, 0, 0.1, 0.05, 300, 2)
    const avg = (xs: typeof fromA) => xs.slice(150).reduce((s, x) => s + x.a, 0) / 150
    // 理論上 A 占 pr / (pf + pr) = 1/3
    expect(avg(fromA)).toBeGreaterThan(15)
    expect(avg(fromA)).toBeLessThan(25)
    expect(Math.abs(avg(fromA) - avg(fromB))).toBeLessThan(5)
    expect(fromA.slice(150).every((x) => x.a + x.b === 60)).toBe(true)
    expect(fromA.slice(150).reduce((s, x) => s + x.forward, 0)).toBeGreaterThan(0)
  })
})
