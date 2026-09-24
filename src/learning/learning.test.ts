import { describe, expect, it } from 'vitest'
import { ELECTROLYTES, conductivity, dissociationFraction, electrolytePh } from '../chem/acidBase'
import { REACTIONS } from '../chem/equations'
import { pairSteps } from '../chem/stoichiometry'
import { CONCEPT_BY_ID } from './concepts'
import { isMastered, updateMastery } from './mastery'
import { MISCONCEPTIONS } from './misconceptions'
import { ACID_BASE_QUESTIONS } from './questions/acidBase'
import { MOLE_QUESTIONS } from './questions/mole'
import { createStore, parseState } from './store'
import { grade } from './twoTier'

const electrolyte = (id: string) => ELECTROLYTES.find((e) => e.id === id)!

describe('mastery (BKT)', () => {
  it('converges to mastery after consecutive correct answers', () => {
    let p = 0.2
    for (let i = 0; i < 5; i++) p = updateMastery(p, true)
    expect(isMastered(p)).toBe(true)
  })
  it('drops after a wrong answer', () => {
    expect(updateMastery(0.8, false)).toBeLessThan(0.8)
    expect(updateMastery(0.8, true)).toBeGreaterThan(0.8)
  })
})

describe('two-tier grading', () => {
  const q = MOLE_QUESTIONS[0]
  it('returns the three verdicts and the triggered misconception', () => {
    expect(grade(q, 0, 0)).toEqual({ verdict: 'correct' })
    expect(grade(q, 0, 1)).toEqual({ verdict: 'right-answer-wrong-reason', misconception: 'limiting-no-ratio' })
    expect(grade(q, 3, 2)).toEqual({ verdict: 'wrong', misconception: 'all-consumed' })
    expect(grade(q, 1, 0)).toEqual({ verdict: 'wrong', misconception: 'limiting-no-ratio' })
  })
})

describe('question banks', () => {
  const all = [...MOLE_QUESTIONS, ...ACID_BASE_QUESTIONS]
  it('ids are unique', () => {
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length)
  })
  it.each(all.map((q) => [q.id, q] as const))('%s is well-formed', (_, q) => {
    expect(q.options.filter((o) => o.correct)).toHaveLength(1)
    expect(q.reasons.filter((o) => o.correct)).toHaveLength(1)
    expect(CONCEPT_BY_ID[q.concept]).toBeDefined()
    for (const c of [...q.options, ...q.reasons]) {
      if (c.misconception) expect(MISCONCEPTIONS[c.misconception], c.misconception).toBeDefined()
      expect(c.correct && c.misconception).toBeFalsy()
    }
  })
})

describe('store', () => {
  const memory = () => {
    const data = new Map<string, string>()
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    }
  }
  it('records attempts, mistakes, and persists', () => {
    const storage = memory()
    const store = createStore(storage)
    store.record('mole.limiting', false, { misconceptionId: 'limiting-no-ratio' })
    store.record('mole.limiting', true)
    const s = store.getState()
    expect(s.concepts['mole.limiting'].attempts).toBe(2)
    expect(s.concepts['mole.limiting'].correct).toBe(1)
    expect(s.mistakes).toHaveLength(1)
    expect(createStore(storage).getState()).toEqual(s)
  })
  it('survives corrupted data and throwing storage', () => {
    const storage = memory()
    storage.setItem('fullmetal.learning.v1', '{not json')
    expect(createStore(storage).getState().mistakes).toEqual([])
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    const store = createStore(broken)
    store.record('acid.ph-scale', true)
    expect(store.getState().concepts['acid.ph-scale'].attempts).toBe(1)
    store.reset()
    expect(store.getState().concepts).toEqual({})
  })
  it('rejects invalid imports', () => {
    const store = createStore(memory())
    expect(store.importJson('{"version":2}')).toBe(false)
    expect(parseState({ version: 1, concepts: { a: { p: 7 } }, mistakes: [] })?.concepts).toEqual({})
    expect(store.importJson(JSON.stringify({ version: 1, concepts: { a: { p: 0.5, attempts: 3 } }, mistakes: [] }))).toBe(true)
    expect(store.getState().concepts.a.attempts).toBe(3)
  })
})

describe('weak electrolytes', () => {
  it('0.1 M acetic acid and ammonia', () => {
    const acetic = electrolyte('CH3COOH')
    expect(electrolytePh(acetic, 0.1)).toBeCloseTo(2.87, 1)
    expect(dissociationFraction(acetic, 0.1)).toBeCloseTo(0.0133, 3)
    expect(electrolytePh(electrolyte('NH3'), 0.1)).toBeCloseTo(11.13, 1)
  })
  it('strong acids fully dissociate; dilution raises weak-acid α', () => {
    expect(electrolytePh(electrolyte('HCl'), 0.01)).toBeCloseTo(2, 5)
    const acetic = electrolyte('CH3COOH')
    expect(dissociationFraction(acetic, 0.01)).toBeGreaterThan(dissociationFraction(acetic, 0.1))
  })
  it('dilute strong acid conducts better than concentrated weak acid', () => {
    expect(conductivity(electrolyte('HCl'), 0.02)).toBeGreaterThan(conductivity(electrolyte('CH3COOH'), 0.2))
  })
})

describe('particle pairing', () => {
  it('5 H2 + 2 O2 -> 4 H2O with 1 H2 left', () => {
    const steps = pairSteps(REACTIONS.find((r) => r.id === 'water')!, [5, 2])
    expect(steps).toHaveLength(3)
    expect(steps.at(-1)!.counts).toEqual([1, 0, 4])
  })
})

describe('particle pairing defaults', () => {
  it('coefficient multiples leave exactly one leftover reactant', () => {
    for (const r of REACTIONS.filter((x) => x.reactants.length === 2)) {
      for (let a = r.coefficients[0]; a <= 12; a += r.coefficients[0]) {
        for (let b = r.coefficients[1]; b <= 12; b += r.coefficients[1]) {
          const left = pairSteps(r, [a, b]).at(-1)!.counts.slice(0, 2)
          expect(left.filter((n) => n > 0).length, `${r.id} ${a},${b}`).toBeLessThanOrEqual(1)
        }
      }
    }
  })
})

describe('sci format', () => {
  it('formats scientific notation with superscripts', async () => {
    const { sci } = await import('../lib/format')
    expect(sci(1.8e-5, 1)).toBe('1.8×10⁻⁵')
    expect(sci(1.3333e-3)).toBe('1.33×10⁻³')
    expect(sci(6.02e23)).toBe('6.02×10²³')
  })
})
