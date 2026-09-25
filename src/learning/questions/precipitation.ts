import type { TwoTierQuestion } from '../twoTier'

export const PRECIPITATION_QUESTIONS: TwoTierQuestion[] = [
  {
    id: 'ppt-j1',
    concept: 'ion.precipitation',
    level: 'junior',
    stem: '硝酸銀溶液和氯化鈉溶液混合，產生白色的氯化銀沉澱。反應後，溶液中主要還有哪些離子？',
    options: [
      { text: '{{Na^+}} 和 {{NO3^-}}', correct: true },
      { text: '沒有離子了', misconception: 'spectators-react' },
      { text: '大量的 {{Ag^+}} 和 {{Cl^-}}' },
      { text: '{{AgCl}} 分子' },
    ],
    reasons: [
      { text: '{{Ag^+}} 和 {{Cl^-}} 結合成沉澱，{{Na^+}}、{{NO3^-}} 是旁觀離子，仍留在溶液中', correct: true },
      { text: '所有離子都結合成沉澱了', misconception: 'spectators-react' },
      { text: '沉澱會再溶解，變回離子' },
    ],
  },
  {
    id: 'ppt-j2',
    concept: 'ion.precipitation',
    level: 'junior',
    stem: '把硝酸鉀溶液和氯化鈉溶液混合，會產生沉澱嗎？',
    options: [
      { text: '不會', correct: true },
      { text: '會，產生氯化鉀沉澱', misconception: 'all-mix-precipitate' },
      { text: '會，產生硝酸鈉沉澱', misconception: 'all-mix-precipitate' },
    ],
    reasons: [
      { text: '含鉀、鈉、硝酸根的化合物都可溶，離子只是混在一起', correct: true },
      { text: '兩種溶液混合時，離子一定會交換並形成沉澱', misconception: 'all-mix-precipitate' },
      { text: '溶液的顏色沒有改變，所以不會反應' },
    ],
  },
  {
    id: 'ppt-j3',
    concept: 'ion.precipitation',
    level: 'junior',
    stem: '{{AgNO3 + NaCl -> AgCl↓ + NaNO3}} 的淨離子反應式是什麼？',
    options: [
      { text: '{{Ag^+ + Cl^- -> AgCl↓}}', correct: true },
      { text: '{{Na^+ + NO3^- -> NaNO3}}', misconception: 'spectators-react' },
      { text: '{{AgNO3 + NaCl -> AgCl↓ + NaNO3}}', misconception: 'spectators-react' },
    ],
    reasons: [
      { text: '只寫出實際結合的離子；旁觀離子在反應前後相同，要刪去', correct: true },
      { text: '{{NaNO3}} 也是生成物，所以要寫進淨離子反應式', misconception: 'spectators-react' },
      { text: '淨離子反應式和完整反應式其實一樣' },
    ],
  },
]
