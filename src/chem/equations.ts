export type Level = 'easy' | 'medium' | 'hard'

export interface Reaction {
  id: string
  nameZh: string
  level: Level
  reactants: string[]
  products: string[]
  /** 最簡整數比的平衡係數，依 reactants、products 順序 */
  coefficients: number[]
  note?: string
}

export const LEVEL_LABEL: Record<Level, string> = { easy: '入門', medium: '進階', hard: '挑戰' }

export const REACTIONS: Reaction[] = [
  { id: 'water', nameZh: '氫氣燃燒生成水', level: 'easy', reactants: ['H2', 'O2'], products: ['H2O'], coefficients: [2, 1, 2], note: '氫氣是潔淨燃料，燃燒產物只有水。' },
  { id: 'carbon', nameZh: '木炭完全燃燒', level: 'easy', reactants: ['C', 'O2'], products: ['CO2'], coefficients: [1, 1, 1] },
  { id: 'magnesium', nameZh: '鎂帶燃燒', level: 'easy', reactants: ['Mg', 'O2'], products: ['MgO'], coefficients: [2, 1, 2], note: '鎂帶燃燒發出強烈白光，生成白色的氧化鎂。' },
  { id: 'peroxide', nameZh: '雙氧水分解', level: 'easy', reactants: ['H2O2'], products: ['H2O', 'O2'], coefficients: [2, 2, 1], note: '加入二氧化錳當催化劑，可加快分解，用來製造氧氣。' },
  { id: 'zinc', nameZh: '鋅與鹽酸反應', level: 'easy', reactants: ['Zn', 'HCl'], products: ['ZnCl2', 'H2'], coefficients: [1, 2, 1, 1], note: '實驗室製造氫氣的方法。' },
  { id: 'methane', nameZh: '甲烷（天然氣）燃燒', level: 'medium', reactants: ['CH4', 'O2'], products: ['CO2', 'H2O'], coefficients: [1, 2, 1, 2] },
  { id: 'ammonia', nameZh: '合成氨', level: 'medium', reactants: ['N2', 'H2'], products: ['NH3'], coefficients: [1, 3, 2] },
  { id: 'marble', nameZh: '大理石與鹽酸反應', level: 'medium', reactants: ['CaCO3', 'HCl'], products: ['CaCl2', 'H2O', 'CO2'], coefficients: [1, 2, 1, 1, 1], note: '實驗室製造二氧化碳的方法。' },
  { id: 'bakingsoda', nameZh: '小蘇打受熱分解', level: 'medium', reactants: ['NaHCO3'], products: ['Na2CO3', 'H2O', 'CO2'], coefficients: [2, 1, 1, 1], note: '烘焙時小蘇打受熱產生二氧化碳，讓麵糰膨脹。' },
  { id: 'rust', nameZh: '鐵生鏽（氧化鐵）', level: 'hard', reactants: ['Fe', 'O2'], products: ['Fe2O3'], coefficients: [4, 3, 2] },
  { id: 'propane', nameZh: '丙烷（桶裝瓦斯）燃燒', level: 'hard', reactants: ['C3H8', 'O2'], products: ['CO2', 'H2O'], coefficients: [1, 5, 3, 4] },
  { id: 'aluminium', nameZh: '鋁與鹽酸反應', level: 'hard', reactants: ['Al', 'HCl'], products: ['AlCl3', 'H2'], coefficients: [2, 6, 2, 3] },
  { id: 'respiration', nameZh: '葡萄糖氧化（呼吸作用）', level: 'hard', reactants: ['C6H12O6', 'O2'], products: ['CO2', 'H2O'], coefficients: [1, 6, 6, 6] },
]
