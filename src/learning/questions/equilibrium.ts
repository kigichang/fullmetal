import type { TwoTierQuestion } from '../twoTier'

export const EQUILIBRIUM_QUESTIONS: TwoTierQuestion[] = [
  {
    id: 'eq-j1',
    concept: 'eq.dynamic',
    level: 'junior',
    stem: '密閉容器中的 {{N2O4 <=> 2NO2}} 達到平衡後，下列敘述何者正確？',
    options: [
      { text: '正、逆反應仍持續進行，而且速率相等', correct: true },
      { text: '反應已經停止', misconception: 'equilibrium-static' },
      { text: '{{N2O4}} 和 {{NO2}} 的濃度相等', misconception: 'equal-concentrations' },
      { text: '只剩下逆反應在進行' },
    ],
    reasons: [
      { text: '平衡是動態的：正、逆反應速率相等，所以濃度不再改變', correct: true },
      { text: '濃度不再改變，表示已經沒有反應發生', misconception: 'equilibrium-static' },
      { text: '平衡就是反應物和生成物一樣多', misconception: 'equal-concentrations' },
      { text: '生成物累積夠多後，正反應就會停止' },
    ],
  },
  {
    id: 'eq-j2',
    concept: 'eq.le-chatelier',
    level: 'junior',
    stem: '把裝有 {{NO2}}（紅棕色）與 {{N2O4}}（無色）平衡混合氣體的密閉瓶放入熱水中，顏色會如何？（{{N2O4 <=> 2NO2}} 是吸熱反應）',
    options: [
      { text: '變深', correct: true },
      { text: '變淺' },
      { text: '不變', misconception: 'equilibrium-static' },
    ],
    reasons: [
      { text: '升溫使平衡往吸熱的方向（生成 {{NO2}}）移動，紅棕色的 {{NO2}} 變多', correct: true },
      { text: '已經達到平衡，改變溫度也不會再反應', misconception: 'equilibrium-static' },
      { text: '加熱讓氣體膨脹，顏色被稀釋' },
    ],
  },
  {
    id: 'eq-j3',
    concept: 'eq.le-chatelier',
    level: 'junior',
    stem: '在黃色的鉻酸鉀溶液中加入鹽酸，溶液變成橙色。接著再加入氫氧化鈉溶液，溶液會如何？',
    options: [
      { text: '變回黃色', correct: true },
      { text: '維持橙色', misconception: 'one-way' },
      { text: '變成無色' },
    ],
    reasons: [
      { text: '加鹼消耗 {{H^+}}，平衡往左移，二鉻酸根又變回鉻酸根', correct: true },
      { text: '反應已經發生，不能再逆向進行', misconception: 'one-way' },
      { text: '氫氧化鈉會和鉻酸根產生沉澱' },
    ],
  },
  {
    id: 'eq-j4',
    concept: 'eq.le-chatelier',
    level: 'junior',
    stem: '工業合成氨（{{N2 + 3H2 <=> 2NH3}}）時加入鐵催化劑，達到平衡時氨的產量會如何？',
    options: [
      { text: '不變，只是比較快達到平衡', correct: true },
      { text: '增加', misconception: 'catalyst-shifts' },
      { text: '減少' },
    ],
    reasons: [
      { text: '催化劑同樣加快正反應和逆反應，不改變平衡組成', correct: true },
      { text: '催化劑加快正反應，所以會生成更多氨', misconception: 'catalyst-shifts' },
      { text: '催化劑在反應中會被消耗' },
    ],
  },
  {
    id: 'eq-s1',
    concept: 'eq.q-vs-k',
    level: 'senior',
    stem: '某反應在定溫下的平衡常數 K = 4。某一時刻測得反應商 Q = 10，反應接下來會怎麼進行？',
    options: [
      { text: '淨反應往逆反應方向（向左）', correct: true },
      { text: '淨反應往正反應方向（向右）' },
      { text: '已經達到平衡', misconception: 'equilibrium-static' },
    ],
    reasons: [
      { text: 'Q > K，生成物相對太多，淨反應向左直到 Q = K', correct: true },
      { text: 'Q 比 K 大，表示反應還沒進行完，要繼續向右' },
      { text: '只要溫度不變就已經是平衡狀態', misconception: 'equilibrium-static' },
    ],
  },
  {
    id: 'eq-s2',
    concept: 'eq.q-vs-k',
    level: 'senior',
    stem: '定溫下，在 {{N2O4 <=> 2NO2}} 的平衡系統中再加入一些 {{NO2}}。重新達到平衡後，平衡常數 K 會如何？',
    options: [
      { text: '不變', correct: true },
      { text: '變大', misconception: 'k-changes-with-concentration' },
      { text: '變小', misconception: 'k-changes-with-concentration' },
    ],
    reasons: [
      { text: 'K 只受溫度影響；改變濃度只會讓 Q 暫時偏離 K', correct: true },
      { text: '加入生成物，K 的分子變大，所以 K 變大', misconception: 'k-changes-with-concentration' },
      { text: '平衡向左移，所以 K 變小', misconception: 'k-changes-with-concentration' },
    ],
  },
  {
    id: 'eq-s3',
    concept: 'eq.le-chatelier',
    level: 'senior',
    stem: '在 {{N2O4 <=> 2NO2}} 的平衡系統中加入 {{NO2}}，重新達到平衡後，{{NO2}} 的濃度和加入前相比如何？',
    options: [
      { text: '比加入前大，但比剛加入時小', correct: true },
      { text: '回到和加入前一樣', misconception: 'full-restoration' },
      { text: '比剛加入時還大' },
    ],
    reasons: [
      { text: '平衡移動只能減輕改變，不能完全抵消', correct: true },
      { text: '勒沙特列原理會讓系統回到原來的狀態', misconception: 'full-restoration' },
      { text: '加入的 {{NO2}} 會全部變成 {{N2O4}}' },
    ],
  },
]
