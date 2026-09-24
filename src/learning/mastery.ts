/** 貝氏知識追蹤（BKT）參數 */
export interface BktParams {
  /** 一開始就會的機率 */
  init: number
  /** 每次練習後學會的機率 */
  transit: number
  /** 會了卻答錯（粗心）的機率 */
  slip: number
  /** 不會卻猜對的機率 */
  guess: number
}

export const DEFAULT_BKT: BktParams = { init: 0.2, transit: 0.15, slip: 0.1, guess: 0.25 }

/** 預測答對率達 95% 視為精熟（Corbett & Anderson 常用門檻） */
export const MASTERY_THRESHOLD = 0.95

/** 依本次作答結果更新「已經學會」的機率 */
export function updateMastery(pKnown: number, correct: boolean, params: BktParams = DEFAULT_BKT): number {
  const { slip, guess, transit } = params
  const posterior = correct
    ? (pKnown * (1 - slip)) / (pKnown * (1 - slip) + (1 - pKnown) * guess)
    : (pKnown * slip) / (pKnown * slip + (1 - pKnown) * (1 - guess))
  return posterior + (1 - posterior) * transit
}

/** 預測下一題答對的機率 */
export function predictCorrect(pKnown: number, params: BktParams = DEFAULT_BKT): number {
  return pKnown * (1 - params.slip) + (1 - pKnown) * params.guess
}

export function isMastered(pKnown: number): boolean {
  return pKnown >= MASTERY_THRESHOLD
}
