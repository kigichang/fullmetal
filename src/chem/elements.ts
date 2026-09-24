export interface Element {
  symbol: string
  nameZh: string
  /** 國中課本常用的近似原子量 */
  mass: number
  /** 粒子圖顏色（接近 CPK 配色） */
  color: string
  /** 粒子圖相對半徑 */
  radius: number
}

const list: Element[] = [
  { symbol: 'H', nameZh: '氫', mass: 1, color: '#f5f5f4', radius: 0.7 },
  { symbol: 'C', nameZh: '碳', mass: 12, color: '#3f3f46', radius: 1 },
  { symbol: 'N', nameZh: '氮', mass: 14, color: '#2563eb', radius: 1 },
  { symbol: 'O', nameZh: '氧', mass: 16, color: '#dc2626', radius: 1 },
  { symbol: 'Na', nameZh: '鈉', mass: 23, color: '#8b5cf6', radius: 1.15 },
  { symbol: 'Mg', nameZh: '鎂', mass: 24, color: '#15803d', radius: 1.1 },
  { symbol: 'Al', nameZh: '鋁', mass: 27, color: '#a8a29e', radius: 1.1 },
  { symbol: 'S', nameZh: '硫', mass: 32, color: '#eab308', radius: 1.1 },
  { symbol: 'Cl', nameZh: '氯', mass: 35.5, color: '#22c55e', radius: 1.1 },
  { symbol: 'K', nameZh: '鉀', mass: 39, color: '#7c3aed', radius: 1.25 },
  { symbol: 'Ca', nameZh: '鈣', mass: 40, color: '#65a30d', radius: 1.2 },
  { symbol: 'Fe', nameZh: '鐵', mass: 56, color: '#78716c', radius: 1.15 },
  { symbol: 'Cu', nameZh: '銅', mass: 63.5, color: '#b45309', radius: 1.15 },
  { symbol: 'Zn', nameZh: '鋅', mass: 65, color: '#64748b', radius: 1.15 },
  { symbol: 'Ag', nameZh: '銀', mass: 108, color: '#94a3b8', radius: 1.2 },
  { symbol: 'I', nameZh: '碘', mass: 127, color: '#7e22ce', radius: 1.25 },
  { symbol: 'Ba', nameZh: '鋇', mass: 137, color: '#0d9488', radius: 1.3 },
  { symbol: 'Pb', nameZh: '鉛', mass: 207, color: '#475569', radius: 1.3 },
]

export const ELEMENTS: Record<string, Element> = Object.fromEntries(list.map((e) => [e.symbol, e]))

export function getElement(symbol: string): Element {
  const el = ELEMENTS[symbol]
  if (!el) throw new Error(`未知元素：${symbol}`)
  return el
}
