export type Rgba = [number, number, number, number]

export interface ColorStop {
  pH: number
  color: Rgba
}

export interface Indicator {
  id: string
  nameZh: string
  /** 顏色停點，pH 由小到大；範圍外取端點顏色，中間線性內插 */
  stops: ColorStop[]
  desc: string
}

const CLEAR: Rgba = [226, 232, 240, 0.35]

export const INDICATORS: Indicator[] = [
  {
    id: 'litmus',
    nameZh: '石蕊',
    stops: [
      { pH: 4.5, color: [220, 38, 38, 0.85] },
      { pH: 6.4, color: [147, 51, 234, 0.8] },
      { pH: 8.3, color: [37, 99, 235, 0.85] },
    ],
    desc: '酸性呈紅色、鹼性呈藍色（pH 4.5–8.3 間為紫色）',
  },
  {
    id: 'phenolphthalein',
    nameZh: '酚酞',
    stops: [
      { pH: 8.2, color: CLEAR },
      { pH: 10, color: [236, 72, 153, 0.85] },
    ],
    desc: '酸性、中性無色；pH 大於約 8.2 變粉紅色',
  },
  {
    id: 'btb',
    nameZh: '溴瑞香草酚藍 (BTB)',
    stops: [
      { pH: 6.0, color: [234, 179, 8, 0.85] },
      { pH: 6.8, color: [34, 197, 94, 0.85] },
      { pH: 7.6, color: [37, 99, 235, 0.85] },
    ],
    desc: '酸性黃色、中性綠色、鹼性藍色',
  },
  {
    id: 'universal',
    nameZh: '廣用試劑',
    stops: [
      { pH: 1, color: [220, 38, 38, 0.9] },
      { pH: 3, color: [234, 88, 12, 0.9] },
      { pH: 5, color: [245, 158, 11, 0.9] },
      { pH: 6, color: [234, 204, 21, 0.9] },
      { pH: 7, color: [34, 197, 94, 0.9] },
      { pH: 8, color: [13, 148, 136, 0.9] },
      { pH: 9, color: [37, 99, 235, 0.9] },
      { pH: 11, color: [79, 70, 229, 0.9] },
      { pH: 13, color: [126, 34, 206, 0.9] },
    ],
    desc: '由紅（強酸）→ 綠（中性）→ 紫（強鹼），可估計 pH 值',
  },
]

export function indicatorColor(pH: number, indicator: Indicator): Rgba {
  const { stops } = indicator
  if (pH <= stops[0].pH) return stops[0].color
  const last = stops[stops.length - 1]
  if (pH >= last.pH) return last.color
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (pH <= b.pH) {
      const t = (pH - a.pH) / (b.pH - a.pH)
      return a.color.map((v, k) => {
        const mixed = v + (b.color[k] - v) * t
        return k === 3 ? Math.round(mixed * 100) / 100 : Math.round(mixed)
      }) as Rgba
    }
  }
  return last.color
}

export const rgbaCss = ([r, g, b, a]: Rgba) => `rgba(${r}, ${g}, ${b}, ${a})`

/** 強酸（HCl）與強鹼（NaOH）混合後的 pH。濃度 M、體積 mL。 */
export function neutralizationPh(cAcid: number, vAcid: number, cBase: number, vBase: number): number {
  const nH = cAcid * vAcid // mmol
  const nOH = cBase * vBase
  const vTotal = vAcid + vBase
  const diff = nH - nOH
  let pH: number
  if (Math.abs(diff) < 1e-9) pH = 7
  else if (diff > 0) pH = -Math.log10(diff / vTotal)
  else pH = 14 + Math.log10(-diff / vTotal)
  // 極稀時會越過 7，夾在合理範圍內（國中不討論水的解離）
  if (diff > 0) pH = Math.min(pH, 7)
  if (diff < 0) pH = Math.max(pH, 7)
  return Math.max(0, Math.min(14, pH))
}

/** 中和熱造成的理想溫度上升（°C）：每莫耳水放熱約 57 kJ，溶液比熱視為水 */
export function neutralizationTempRise(cAcid: number, vAcid: number, cBase: number, vBase: number): number {
  const nWater = Math.min(cAcid * vAcid, cBase * vBase) / 1000 // mol
  const massG = vAcid + vBase
  if (massG === 0) return 0
  return (57000 * nWater) / (massG * 4.18)
}

export interface Substance {
  nameZh: string
  pH: number
}

/** 常見物質的 pH 參考值（實際數值依產品、濃度而異） */
export const SUBSTANCES: Substance[] = [
  { nameZh: '胃酸', pH: 1.5 },
  { nameZh: '檸檬汁', pH: 2.3 },
  { nameZh: '可樂', pH: 2.5 },
  { nameZh: '食用醋', pH: 2.9 },
  { nameZh: '番茄汁', pH: 4.2 },
  { nameZh: '雨水', pH: 5.6 },
  { nameZh: '牛奶', pH: 6.6 },
  { nameZh: '純水', pH: 7.0 },
  { nameZh: '血液', pH: 7.4 },
  { nameZh: '海水', pH: 8.1 },
  { nameZh: '小蘇打水', pH: 8.3 },
  { nameZh: '肥皂水', pH: 10 },
  { nameZh: '氨水', pH: 11.5 },
  { nameZh: '漂白水', pH: 12.5 },
  { nameZh: '水管疏通劑', pH: 13.5 },
]

export function acidityLabel(pH: number): string {
  if (pH < 6.95) return '酸性'
  if (pH > 7.05) return '鹼性'
  return '中性'
}
