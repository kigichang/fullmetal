import { describe, expect, it } from 'vitest'
import { MAIN_GROUP, mainGroupColumn, trendValue, TRENDS } from './periodicTrends'

const v = (s: string, p: 'radius' | 'ie' | 'en') => trendValue(s, p)!

describe('trend data', () => {
  it('covers the 42 main-group elements of periods 1–6 in unique cells', () => {
    expect(MAIN_GROUP).toHaveLength(42)
    const cells = MAIN_GROUP.map((e) => `${e.period},${mainGroupColumn(e)}`)
    expect(new Set(cells).size).toBe(42)
    for (const s of Object.keys(TRENDS)) expect(MAIN_GROUP.some((e) => e.symbol === s), s).toBe(true)
  })

  it('radius shrinks across period 3 and grows down group 1', () => {
    const p3 = ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl'].map((s) => v(s, 'radius'))
    p3.slice(1).forEach((r, i) => expect(r).toBeLessThan(p3[i]))
    const g1 = ['Li', 'Na', 'K', 'Rb', 'Cs'].map((s) => v(s, 'radius'))
    g1.slice(1).forEach((r, i) => expect(r).toBeGreaterThan(g1[i]))
  })

  it('ionization energy: group 1 decreases, noble gases peak, textbook exceptions', () => {
    const g1 = ['Li', 'Na', 'K', 'Rb', 'Cs'].map((s) => v(s, 'ie'))
    g1.slice(1).forEach((x, i) => expect(x).toBeLessThan(g1[i]))
    expect(v('Ne', 'ie')).toBeGreaterThan(v('F', 'ie'))
    expect(v('Be', 'ie')).toBeGreaterThan(v('B', 'ie'))
    expect(v('N', 'ie')).toBeGreaterThan(v('O', 'ie'))
    expect(v('Mg', 'ie')).toBeGreaterThan(v('Al', 'ie'))
    expect(v('P', 'ie')).toBeGreaterThan(v('S', 'ie'))
  })

  it('electronegativity: F is the maximum, increases across period 2', () => {
    const ens = Object.values(TRENDS).map((t) => t.en ?? 0)
    expect(Math.max(...ens)).toBe(v('F', 'en'))
    const p2 = ['Li', 'Be', 'B', 'C', 'N', 'O', 'F'].map((s) => v(s, 'en'))
    p2.slice(1).forEach((x, i) => expect(x).toBeGreaterThan(p2[i]))
  })
})
