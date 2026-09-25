import type { ToolMeta } from '../components/ToolLayout'

export const TOOLS = {
  periodicTable: {
    path: '/periodic-table',
    title: '元素週期表',
    unit: '八年級・物質的基本結構',
    goal: '118 個元素一次看齊：點任一元素看電子排列、原子量與生活應用。',
    preview: 'H He Li Be B C N O',
  },
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
    goal: '先用分子個數預測誰會剩下，再一步步把克數換成莫耳，找出限量試劑。',
    preview: 'CH4 + 2O2 -> CO2 + 2H2O',
  },
  acidBase: {
    path: '/acid-base',
    title: '酸鹼指示劑與中和',
    unit: '八、九年級・電解質與酸鹼鹽',
    goal: '看指示劑在不同 pH 的顏色、觀察中和過程，並比較強酸與弱酸的粒子。',
    preview: 'H^+ + OH^- -> H2O',
  },
  precipitation: {
    path: '/precipitation',
    title: '沉澱反應矩陣',
    unit: '九年級・水溶液中的離子反應',
    goal: '任選陽離子與陰離子，看會不會沉澱、沉澱是什麼顏色。',
    preview: 'Ag^+ + Cl^- -> AgCl↓',
  },
  redox: {
    path: '/redox',
    title: '氧化還原與電池',
    unit: '九年級・氧化與還原（高中：氧化數、電化學）',
    goal: '從得失氧到電子轉移：看金屬置換、電池中電子怎麼流，並一步步推算氧化數。',
    preview: 'Zn + Cu^2+ -> Zn^2+ + Cu',
  },
  equilibrium: {
    path: '/equilibrium',
    title: '化學平衡',
    unit: '九年級・可逆反應與平衡（高中：平衡常數）',
    goal: '看平衡時粒子仍在反應，再改變溫度、濃度、壓力，觀察平衡怎麼移動。',
    preview: 'N2O4 <=> 2NO2',
  },
} satisfies Record<string, ToolMeta>
