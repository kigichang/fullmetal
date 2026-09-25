import { describe, expect, it } from 'vitest'
import { configurationOf, gridPosition, PERIODIC_TABLE } from './periodicTable'

const el = (symbol: string) => PERIODIC_TABLE.find((e) => e.symbol === symbol)!

describe('periodic table data', () => {
  it('has 118 unique elements in unique grid cells', () => {
    expect(PERIODIC_TABLE).toHaveLength(118)
    expect(new Set(PERIODIC_TABLE.map((e) => e.symbol)).size).toBe(118)
    const cells = PERIODIC_TABLE.map((e) => {
      const { row, col } = gridPosition(e)
      return `${row},${col}`
    })
    expect(new Set(cells).size).toBe(118)
  })

  it('places elements in the right period and group', () => {
    expect([el('He').period, el('He').group]).toEqual([1, 18])
    expect([el('Na').period, el('Na').group]).toEqual([3, 1])
    expect([el('Al').period, el('Al').group]).toEqual([3, 13])
    expect([el('Fe').period, el('Fe').group]).toEqual([4, 8])
    expect([el('Hf').period, el('Hf').group]).toEqual([6, 4])
    expect([el('Og').period, el('Og').group]).toEqual([7, 18])
    expect(el('La').group).toBeNull()
    expect(el('Lr').group).toBeNull()
  })

  it('electron shells always add up to the atomic number', () => {
    for (const e of PERIODIC_TABLE) {
      expect(e.shells.reduce((a, b) => a + b, 0), e.symbol).toBe(e.z)
      expect(e.shells.at(-1), e.symbol).toBeGreaterThan(0)
    }
  })

  it('shell distributions match textbooks', () => {
    expect(el('Na').shells).toEqual([2, 8, 1])
    expect(el('Ca').shells).toEqual([2, 8, 8, 2])
    expect(el('Fe').shells).toEqual([2, 8, 14, 2])
    expect(el('Cu').shells).toEqual([2, 8, 18, 1])
    expect(el('Pd').shells).toEqual([2, 8, 18, 18])
    expect(el('Au').shells).toEqual([2, 8, 18, 32, 18, 1])
    expect(el('U').shells).toEqual([2, 8, 18, 32, 21, 9, 2])
  })

  it('configurations use noble-gas cores and known exceptions', () => {
    expect(configurationOf(1)).toBe('1s1')
    expect(configurationOf(8)).toBe('[He] 2s2 2p4')
    expect(configurationOf(26)).toBe('[Ar] 3d6 4s2')
    expect(configurationOf(24)).toBe('[Ar] 3d5 4s1')
    expect(configurationOf(29)).toBe('[Ar] 3d10 4s1')
    expect(configurationOf(35)).toBe('[Ar] 3d10 4s2 4p5')
    expect(configurationOf(46)).toBe('[Kr] 4d10')
    expect(configurationOf(64)).toBe('[Xe] 4f7 5d1 6s2')
    expect(configurationOf(79)).toBe('[Xe] 4f14 5d10 6s1')
    expect(configurationOf(103)).toBe('[Rn] 5f14 7s2 7p1')
  })

  it('classifies categories and states', () => {
    expect(el('Na').category).toBe('alkali')
    expect(el('Mg').category).toBe('alkaline')
    expect(el('Si').category).toBe('metalloid')
    expect(el('Cl').category).toBe('halogen')
    expect(el('Ar').category).toBe('noble')
    expect(el('Br').state).toBe('liquid')
    expect(el('Hg').state).toBe('liquid')
    expect(el('N').state).toBe('gas')
    expect(el('Tc').massIsMassNumber).toBe(true)
    expect(el('U').massIsMassNumber).toBe(false)
  })
})

describe('orbital boxes', () => {
  it("follows Hund's rule: N has three unpaired 2p electrons, O has one pair", async () => {
    const { orbitalBoxes } = await import('./periodicTable')
    const p = (z: number) => orbitalBoxes(z).find((b) => b.name === '2p')!.orbitals
    expect(p(7)).toEqual([[true, false], [true, false], [true, false]])
    expect(p(8)).toEqual([[true, true], [true, false], [true, false]])
  })
  it('shows 4s before 3d and the chromium exception', async () => {
    const { orbitalBoxes, ruleConfiguration, configurationOf, hasConfigurationException } = await import('./periodicTable')
    expect(orbitalBoxes(19).map((b) => b.name)).toEqual(['1s', '2s', '2p', '3s', '3p', '4s'])
    expect(ruleConfiguration(24)).toBe('[Ar] 3d4 4s2')
    expect(configurationOf(24)).toBe('[Ar] 3d5 4s1')
    expect(hasConfigurationException(24)).toBe(true)
    expect(hasConfigurationException(26)).toBe(false)
    const total = (z: number) => orbitalBoxes(z).reduce((s, b) => s + b.electrons, 0)
    for (let z = 1; z <= 36; z++) expect(total(z), String(z)).toBe(z)
  })
})
