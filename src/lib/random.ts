/** 固定種子的偽亂數（0–1），讓粒子位置看起來自然、但每次渲染都一樣 */
export function seeded(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}
