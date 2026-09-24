export type Level = 'junior' | 'senior'

export interface Concept {
  id: string
  nameZh: string
  level: Level
  /** 對應工具（含分頁參數），供「去練習」連結 */
  link: string
}

export const CONCEPTS: Concept[] = [
  { id: 'reaction.mass-conservation', nameZh: '質量守恆', level: 'junior', link: '/balance' },
  { id: 'mole.conversion', nameZh: '質量、莫耳數與粒子數換算', level: 'junior', link: '/stoichiometry?tab=mass' },
  { id: 'mole.ratio', nameZh: '係數比與莫耳數比', level: 'junior', link: '/stoichiometry?tab=pairing' },
  { id: 'mole.limiting', nameZh: '限量試劑', level: 'junior', link: '/stoichiometry?tab=pairing' },
  { id: 'acid.ph-scale', nameZh: 'pH 值與酸鹼性', level: 'junior', link: '/acid-base?tab=scale' },
  { id: 'acid.indicator', nameZh: '酸鹼指示劑', level: 'junior', link: '/acid-base?tab=scale' },
  { id: 'acid.neutralization', nameZh: '酸鹼中和', level: 'junior', link: '/acid-base?tab=neutralize' },
  { id: 'acid.strength-vs-concentration', nameZh: '酸鹼的強度與濃度', level: 'junior', link: '/acid-base?tab=strength' },
  { id: 'acid.weak-ph', nameZh: '弱酸弱鹼的 pH 與解離度', level: 'senior', link: '/acid-base?tab=strength&level=senior' },
]

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]))

export const LEVEL_LABEL: Record<Level, string> = { junior: '國中', senior: '高中' }
