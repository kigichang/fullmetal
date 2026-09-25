/** 取「好讀」的刻度間距（1、2、5 × 10ⁿ），讓座標軸約有 3–5 個刻度 */
export function niceStep(max: number): number {
  const raw = max / 4
  const p = 10 ** Math.floor(Math.log10(raw))
  const m = raw / p
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p
}
