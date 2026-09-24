import type { Level } from './concepts'

export interface Choice {
  /** 可含 {{Chem}} 片段 */
  text: string
  correct?: boolean
  /** 選了這個選項代表可能有的迷思 */
  misconception?: string
}

export interface TwoTierQuestion {
  id: string
  concept: string
  level: Level
  /** 題幹（可含 {{Chem}} 片段） */
  stem: string
  options: Choice[]
  /** 第二階層：選擇理由 */
  reasons: Choice[]
}

export type Verdict = 'correct' | 'right-answer-wrong-reason' | 'wrong'

export interface GradeResult {
  verdict: Verdict
  /** 依理由優先、其次答案，找出觸發的迷思 */
  misconception?: string
}

export function grade(q: TwoTierQuestion, optionIdx: number, reasonIdx: number): GradeResult {
  const option = q.options[optionIdx]
  const reason = q.reasons[reasonIdx]
  const misconception = reason?.misconception ?? option?.misconception
  if (option?.correct && reason?.correct) return { verdict: 'correct' }
  if (option?.correct) return { verdict: 'right-answer-wrong-reason', misconception }
  return { verdict: 'wrong', misconception }
}
