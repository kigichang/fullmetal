export type Level = 'junior' | 'senior'

export interface Concept {
  id: string
  nameZh: string
  level: Level
  /** 對應工具（含分頁參數），供「去練習」連結 */
  link: string
}

export const CONCEPTS: Concept[] = [
  { id: 'pt.structure', nameZh: '週期表與電子排列（族、週期）', level: 'junior', link: '/periodic-table?tab=inquiry' },
  { id: 'pt.group-trend', nameZh: '同族元素的性質變化', level: 'junior', link: '/periodic-table?tab=inquiry&task=alkali' },
  { id: 'reaction.balancing', nameZh: '化學反應式的平衡', level: 'junior', link: '/balance' },
  { id: 'reaction.mass-conservation', nameZh: '質量守恆', level: 'junior', link: '/balance' },
  { id: 'mole.conversion', nameZh: '質量、莫耳數與粒子數換算', level: 'junior', link: '/stoichiometry?tab=mass' },
  { id: 'mole.ratio', nameZh: '係數比與莫耳數比', level: 'junior', link: '/stoichiometry?tab=pairing' },
  { id: 'mole.limiting', nameZh: '限量試劑', level: 'junior', link: '/stoichiometry?tab=pairing' },
  { id: 'acid.ph-scale', nameZh: 'pH 值與酸鹼性', level: 'junior', link: '/acid-base?tab=scale' },
  { id: 'acid.indicator', nameZh: '酸鹼指示劑', level: 'junior', link: '/acid-base?tab=scale' },
  { id: 'acid.neutralization', nameZh: '酸鹼中和', level: 'junior', link: '/acid-base?tab=neutralize' },
  { id: 'acid.strength-vs-concentration', nameZh: '酸鹼的強度與濃度', level: 'junior', link: '/acid-base?tab=strength' },
  { id: 'ion.precipitation', nameZh: '沉澱反應與淨離子反應式', level: 'junior', link: '/precipitation' },
  { id: 'redox.oxygen', nameZh: '氧化與還原（得氧、失氧）', level: 'junior', link: '/redox?tab=reactions' },
  { id: 'redox.activity', nameZh: '金屬活性與置換反應', level: 'junior', link: '/redox?tab=activity' },
  { id: 'redox.cell', nameZh: '電池的原理', level: 'junior', link: '/redox?tab=cell' },
  { id: 'eq.dynamic', nameZh: '可逆反應與動態平衡', level: 'junior', link: '/equilibrium?tab=dynamic' },
  { id: 'eq.le-chatelier', nameZh: '平衡移動（勒沙特列原理）', level: 'junior', link: '/equilibrium?tab=shift' },
  { id: 'pt.trends', nameZh: '週期趨勢（半徑、游離能、電負度）', level: 'senior', link: '/periodic-table?tab=inquiry&level=senior' },
  { id: 'pt.orbitals', nameZh: '軌域與電子組態', level: 'senior', link: '/periodic-table?tab=orbitals&level=senior' },
  { id: 'acid.weak-ph', nameZh: '弱酸弱鹼的 pH 與解離度', level: 'senior', link: '/acid-base?tab=strength&level=senior' },
  { id: 'redox.oxidation-number', nameZh: '氧化數與電子轉移', level: 'senior', link: '/redox?tab=reactions&level=senior' },
  { id: 'eq.q-vs-k', nameZh: '反應商 Q 與平衡常數 K', level: 'senior', link: '/equilibrium?tab=shift&level=senior' },
]

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]))

export const LEVEL_LABEL: Record<Level, string> = { junior: '國中', senior: '高中' }
