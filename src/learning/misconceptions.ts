export interface Misconception {
  id: string
  /** 迷思本身（學生可能的想法） */
  nameZh: string
  /** 為什麼不對、正確的想法（可含 {{Chem}} 片段） */
  explanation: string
  /** 建議去操作的工具狀態 */
  remedy: { label: string; link: string }
}

const list: Misconception[] = [
  {
    id: 'limiting-no-ratio',
    nameZh: '比較限量試劑時，沒有先除以係數',
    explanation:
      '數量比較少的不一定先用完。要先把各反應物的莫耳數（或個數）除以係數，看各夠做幾「份」反應，份數少的才是限量試劑。',
    remedy: { label: '用粒子配對看看誰會剩下', link: '/stoichiometry?tab=pairing' },
  },
  {
    id: 'limiting-smaller-mass',
    nameZh: '用克數判斷限量試劑',
    explanation: '每種分子的質量不同，克數不能直接比較。要先換成莫耳數，再除以係數比較。',
    remedy: { label: '用引導計算一步步換算', link: '/stoichiometry?tab=mass' },
  },
  {
    id: 'all-consumed',
    nameZh: '以為反應物一定全部用完',
    explanation: '反應物依係數比反應，其中一種用完反應就停止，另一種會剩下。產物的質量只等於「實際參加反應」的反應物質量。',
    remedy: { label: '用粒子配對看看剩下的分子', link: '/stoichiometry?tab=pairing' },
  },
  {
    id: 'coef-is-mass-ratio',
    nameZh: '把係數比當成質量比',
    explanation: '係數比是莫耳數比（分子個數比）。要算質量比，還要各乘上分子量，例如 {{2H2 + O2}} 的質量比是 2×2 : 1×32 = 1 : 8。',
    remedy: { label: '看反應前後的質量變化', link: '/stoichiometry?tab=pairing' },
  },
  {
    id: 'ignore-coefficient',
    nameZh: '只看分子量、忽略係數',
    explanation: '參加反應的分子個數由係數決定，算質量時要用「係數 × 分子量」。',
    remedy: { label: '用粒子配對數數看', link: '/stoichiometry?tab=pairing' },
  },
  {
    id: 'mole-inverted',
    nameZh: '莫耳數公式顛倒',
    explanation: '莫耳數 = 質量 ÷ 分子量。例如 9 克的水：9 ÷ 18 = 0.5 莫耳。可以用單位檢查：g ÷ (g/mol) = mol。',
    remedy: { label: '練習換算莫耳數', link: '/stoichiometry?tab=mass' },
  },
  {
    id: 'gas-no-mass',
    nameZh: '以為氣體沒有質量',
    explanation: '氣體也是由原子組成，一樣有質量。在密閉容器中，反應前後的總質量不變（質量守恆）。',
    remedy: { label: '數數反應前後的原子', link: '/balance' },
  },
  {
    id: 'acid-high-ph',
    nameZh: '以為酸的 pH 比較大',
    explanation: 'pH 小於 7 是酸性，而且 pH 越小，{{H^+}} 濃度越大、酸性越強；pH 大於 7 是鹼性。',
    remedy: { label: '看 pH 色帶與生活中的例子', link: '/acid-base?tab=scale' },
  },
  {
    id: 'more-h-stronger',
    nameZh: '以為分子裡的 H 越多，酸性越強',
    explanation:
      '酸的強弱看它在水中解離出 {{H^+}} 的程度，不是看有幾個 H。{{CH3COOH}} 有 4 個 H，卻只有少部分解離，是弱酸；{{NH3}} 有 3 個 H，溶於水反而產生 {{OH^-}}，是鹼。',
    remedy: { label: '比較鹽酸與醋酸的粒子', link: '/acid-base?tab=strength&left=HCl&lc=0.1&right=CH3COOH&rc=0.1' },
  },
  {
    id: 'strength-is-concentration',
    nameZh: '把「強度」和「濃度」混為一談',
    explanation:
      '強度是指解離的程度（強酸幾乎完全解離），濃度是指溶了多少。稀的強酸，離子可能比濃的弱酸還多。',
    remedy: { label: '比較稀鹽酸與濃醋酸', link: '/acid-base?tab=strength&left=HCl&lc=0.02&right=CH3COOH&rc=0.2' },
  },
  {
    id: 'neutral-means-no-ions',
    nameZh: '以為中和後溶液裡沒有離子',
    explanation: '中和時 {{H^+}} 和 {{OH^-}} 結合成水，但 {{Na^+}}、{{Cl^-}} 等旁觀離子還留在溶液中，所以食鹽水仍能導電。',
    remedy: { label: '看中和時的粒子變化', link: '/acid-base?tab=neutralize' },
  },
  {
    id: 'phenolphthalein-acid',
    nameZh: '以為酚酞不變色就表示酸性',
    explanation: '酚酞在 pH 約 8.2 以下都是無色，所以酸性和中性溶液都不會讓它變色，只能判斷「是不是鹼性」。',
    remedy: { label: '切換不同指示劑比較', link: '/acid-base?tab=scale' },
  },
  {
    id: 'weak-full-dissociation',
    nameZh: '以為弱酸也會完全解離',
    explanation: '弱酸在水中只有少部分解離，{{[H^+]}} 遠小於酸的濃度。0.1 M 醋酸的 {{[H^+]}} 約為 1.3×10⁻³ M，pH 約 2.9，而不是 1。',
    remedy: { label: '看醋酸的解離度', link: '/acid-base?tab=strength&level=senior&left=HCl&lc=0.1&right=CH3COOH&rc=0.1' },
  },
]

export const MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries(list.map((m) => [m.id, m]))
