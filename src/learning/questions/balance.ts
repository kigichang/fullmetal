import type { TwoTierQuestion } from '../twoTier'

export const BALANCE_QUESTIONS: TwoTierQuestion[] = [
  {
    id: 'bal-j1',
    concept: 'reaction.balancing',
    level: 'junior',
    stem: '平衡 {{H2 + O2 -> H2O}} 時，小明把右邊的 {{H2O}} 改成 {{H2O2}}，讓兩邊的氧原子數相等。這樣做對嗎？',
    options: [
      { text: '不對，應該改係數而不是下標', correct: true },
      { text: '對，兩邊原子數已經相等', misconception: 'change-subscripts' },
      { text: '對，只要質量相等就可以' },
    ],
    reasons: [
      { text: '改下標會變成另一種物質（{{H2O2}} 是雙氧水），反應就不是生成水了', correct: true },
      { text: '平衡的目的只是讓原子數相等，改哪裡都可以', misconception: 'change-subscripts' },
      { text: '{{H2O}} 和 {{H2O2}} 是同一種物質' },
    ],
  },
  {
    id: 'bal-j2',
    concept: 'reaction.balancing',
    level: 'junior',
    stem: '{{2NH3}} 中一共有幾個 H 原子？',
    options: [
      { text: '6 個', correct: true },
      { text: '3 個', misconception: 'coefficient-meaning' },
      { text: '5 個', misconception: 'coefficient-meaning' },
      { text: '2 個', misconception: 'coefficient-meaning' },
    ],
    reasons: [
      { text: '係數乘以整個分子：每個 {{NH3}} 有 3 個 H，2 × 3 = 6', correct: true },
      { text: '係數只表示第一個元素（N）的數目', misconception: 'coefficient-meaning' },
      { text: '係數和下標相加：2 + 3 = 5', misconception: 'coefficient-meaning' },
    ],
  },
  {
    id: 'bal-j3',
    concept: 'reaction.balancing',
    level: 'junior',
    stem: '在 {{2H2 + O2 -> 2H2O}} 中，反應前後什麼一定相同？',
    options: [
      { text: '各種原子的數目', correct: true },
      { text: '分子的數目', misconception: 'molecules-conserved' },
      { text: '物質的種類' },
    ],
    reasons: [
      { text: '化學反應只是原子重新組合，原子不會增加也不會消失', correct: true },
      { text: '反應前後分子數也不會改變', misconception: 'molecules-conserved' },
      { text: '反應物和生成物是同樣的物質' },
    ],
  },
]
