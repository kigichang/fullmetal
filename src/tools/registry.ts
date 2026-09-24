import type { ToolMeta } from '../components/ToolLayout'

export const TOOLS = {
  balancer: {
    path: '/balance',
    title: '反應式平衡與質量守恆',
    unit: '八年級・化學反應',
    goal: '調整係數讓兩邊原子數相等，親眼看到「原子不會憑空消失」。',
    preview: '2H2 + O2 -> 2H2O',
  },
  stoichiometry: {
    path: '/stoichiometry',
    title: '莫耳與限量試劑計算台',
    unit: '八年級・原子量、分子量與莫耳',
    goal: '一步一步把克數換成莫耳，找出誰先用完、生成多少產物。',
    preview: 'CH4 + 2O2 -> CO2 + 2H2O',
  },
  acidBase: {
    path: '/acid-base',
    title: '酸鹼指示劑與中和',
    unit: '八、九年級・電解質與酸鹼鹽',
    goal: '看指示劑在不同 pH 的顏色，並滴入氫氧化鈉觀察中和過程。',
    preview: 'H^+ + OH^- -> H2O',
  },
  precipitation: {
    path: '/precipitation',
    title: '沉澱反應矩陣',
    unit: '九年級・水溶液中的離子反應',
    goal: '任選陽離子與陰離子，看會不會沉澱、沉澱是什麼顏色。',
    preview: 'Ag^+ + Cl^- -> AgCl↓',
  },
} satisfies Record<string, ToolMeta>
