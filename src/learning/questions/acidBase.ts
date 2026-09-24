import type { TwoTierQuestion } from '../twoTier'

export const ACID_BASE_QUESTIONS: TwoTierQuestion[] = [
  {
    id: 'acid-j1',
    concept: 'acid.ph-scale',
    level: 'junior',
    stem: '檸檬汁的 pH 約為 2，肥皂水的 pH 約為 10。哪一個的酸性比較強？',
    options: [
      { text: '檸檬汁', correct: true },
      { text: '肥皂水', misconception: 'acid-high-ph' },
      { text: '兩者一樣' },
      { text: '無法比較' },
    ],
    reasons: [
      { text: 'pH 越小，{{H^+}} 濃度越大，酸性越強；pH 大於 7 是鹼性', correct: true },
      { text: 'pH 的數字越大，酸性越強', misconception: 'acid-high-ph' },
      { text: '兩者都是液體，酸鹼性相同' },
      { text: 'pH 只能比較同一種物質' },
    ],
  },
  {
    id: 'acid-j2',
    concept: 'acid.strength-vs-concentration',
    level: 'junior',
    stem: '{{HCl}} 分子有 1 個 H，醋酸 {{CH3COOH}} 分子有 4 個 H。兩杯濃度相同時，哪一杯的 pH 比較小？',
    options: [
      { text: '鹽酸 {{HCl}}', correct: true },
      { text: '醋酸 {{CH3COOH}}', misconception: 'more-h-stronger' },
      { text: '兩杯一樣', misconception: 'strength-is-concentration' },
      { text: '無法判斷' },
    ],
    reasons: [
      { text: '{{HCl}} 在水中幾乎完全解離；醋酸只有少部分解離出 {{H^+}}', correct: true },
      { text: '分子裡的 H 越多，能放出的 {{H^+}} 越多', misconception: 'more-h-stronger' },
      { text: '濃度相同，酸性就一定相同', misconception: 'strength-is-concentration' },
      { text: '有機酸的酸性一定比較強' },
    ],
  },
  {
    id: 'acid-j3',
    concept: 'acid.strength-vs-concentration',
    level: 'junior',
    stem: '氨 {{NH3}} 分子有 3 個 H。氨溶於水形成的氨水是什麼性質？',
    options: [
      { text: '鹼性', correct: true },
      { text: '酸性', misconception: 'more-h-stronger' },
      { text: '中性' },
    ],
    reasons: [
      { text: '{{NH3}} 會和水作用，產生 {{NH4^+}} 與 {{OH^-}}', correct: true },
      { text: '含有 H 的物質溶於水都會產生 {{H^+}}', misconception: 'more-h-stronger' },
      { text: '氣體溶於水都是中性' },
    ],
  },
  {
    id: 'acid-j4',
    concept: 'acid.neutralization',
    level: 'junior',
    stem: '鹽酸加入氫氧化鈉溶液，剛好完全中和後，燒杯裡主要有哪些粒子？',
    options: [
      { text: '水分子、{{Na^+}} 和 {{Cl^-}}', correct: true },
      { text: '只有水分子', misconception: 'neutral-means-no-ions' },
      { text: '大量的 {{H^+}} 和 {{OH^-}}' },
      { text: '{{HCl}} 分子和 {{NaOH}}' },
    ],
    reasons: [
      { text: '{{H^+}} 和 {{OH^-}} 結合成水，{{Na^+}}、{{Cl^-}} 是旁觀離子，仍留在溶液中', correct: true },
      { text: '中和後所有離子都消失了，只剩下水', misconception: 'neutral-means-no-ions' },
      { text: '中和只是把酸和鹼混在一起，粒子不會改變' },
      { text: '酸和鹼不會真的反應，只是互相稀釋' },
    ],
  },
  {
    id: 'acid-j5',
    concept: 'acid.indicator',
    level: 'junior',
    stem: '在某無色溶液中滴入酚酞，溶液仍然無色。這個溶液一定是酸性嗎？',
    options: [
      { text: '不一定，也可能是中性', correct: true },
      { text: '一定是酸性', misconception: 'phenolphthalein-acid' },
      { text: '一定是中性' },
    ],
    reasons: [
      { text: '酚酞在 pH 約 8.2 以下都是無色，酸性和中性都不會變色', correct: true },
      { text: '指示劑沒有變色，就表示溶液是酸性', misconception: 'phenolphthalein-acid' },
      { text: '酚酞遇到酸會變紅，沒變紅就是中性' },
    ],
  },
  {
    id: 'acid-j6',
    concept: 'acid.strength-vs-concentration',
    level: 'junior',
    stem: '0.02 M 的鹽酸和 0.2 M 的醋酸，哪一杯的導電性比較好？',
    options: [
      { text: '0.02 M 鹽酸', correct: true },
      { text: '0.2 M 醋酸', misconception: 'strength-is-concentration' },
      { text: '兩杯一樣' },
    ],
    reasons: [
      { text: '導電性看溶液中離子的多少；鹽酸完全解離，離子反而比較多', correct: true },
      { text: '濃度越大的溶液，導電性一定越好', misconception: 'strength-is-concentration' },
      { text: '醋酸分子的 H 比較多，解離出的離子比較多', misconception: 'more-h-stronger' },
    ],
  },
  {
    id: 'acid-s1',
    concept: 'acid.weak-ph',
    level: 'senior',
    stem: '0.1 M 醋酸（{{Ka}} = 1.8×10⁻⁵）的 pH 約為多少？',
    options: [
      { text: '1.0', misconception: 'weak-full-dissociation' },
      { text: '2.9', correct: true },
      { text: '4.7' },
      { text: '7.0' },
    ],
    reasons: [
      { text: '{{[H^+]}} ≈ √(Ka × C) ≈ 1.3×10⁻³ M', correct: true },
      { text: '醋酸是酸，{{[H^+]}} 就等於酸的濃度 0.1 M', misconception: 'weak-full-dissociation' },
      { text: 'pH 等於 pKa' },
      { text: '弱酸溶液的 pH 都接近 7' },
    ],
  },
  {
    id: 'acid-s2',
    concept: 'acid.weak-ph',
    level: 'senior',
    stem: '把 0.1 M 醋酸稀釋 10 倍後，醋酸的解離百分率會如何變化？',
    options: [
      { text: '變大', correct: true },
      { text: '變小', misconception: 'strength-is-concentration' },
      { text: '不變' },
    ],
    reasons: [
      { text: '稀釋時平衡往解離方向移動，α ≈ √(Ka / C) 會變大', correct: true },
      { text: '濃度變小，解離的比例也跟著變小', misconception: 'strength-is-concentration' },
      { text: 'Ka 是常數，所以解離百分率也不變' },
    ],
  },
]
