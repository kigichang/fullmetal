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
  {
    id: 'contains-o-is-oxidized',
    nameZh: '以為含氧的物質就是被氧化的一方',
    explanation: '要看反應前後的變化：得到氧的物質被氧化，失去氧的物質被還原。{{CuO + H2 -> Cu + H2O}} 中，{{CuO}} 失去氧被還原，{{H2}} 得到氧被氧化。',
    remedy: { label: '分析氫氣還原氧化銅', link: '/redox?tab=reactions&rx=cuo-h2' },
  },
  {
    id: 'agent-confusion',
    nameZh: '把氧化劑、還原劑和「被氧化、被還原」弄反',
    explanation: '還原劑使別人被還原，自己被氧化；氧化劑使別人被氧化，自己被還原。例如鎂帶燃燒時，{{O2}} 是氧化劑，它本身被還原。',
    remedy: { label: '看反應中誰被氧化、誰被還原', link: '/redox?tab=reactions&rx=mg-o2' },
  },
  {
    id: 'oxidation-needs-oxygen',
    nameZh: '以為氧化還原一定要有氧參與',
    explanation: '「得氧、失氧」是國中的說法；更完整的定義是電子轉移：失去電子（氧化數升高）是氧化，得到電子（氧化數降低）是還原。{{Zn + Cu^2+ -> Zn^2+ + Cu}} 沒有氧，但仍是氧化還原。',
    remedy: { label: '用氧化數分析鋅與銅離子', link: '/redox?tab=reactions&rx=zn-cu&level=senior' },
  },
  {
    id: 'reduction-loses-electrons',
    nameZh: '把「還原」和「失去電子」配在一起',
    explanation: '失去電子是氧化（氧化數升高），得到電子是還原（氧化數降低）。',
    remedy: { label: '看氧化數怎麼變化', link: '/redox?tab=reactions&level=senior' },
  },
  {
    id: 'less-active-displaces',
    nameZh: '以為任何金屬都能置換溶液中的金屬離子',
    explanation: '只有活性較大的金屬，才能把活性較小的金屬離子還原成金屬。銅比鋅不活潑，所以銅片放進硫酸鋅溶液不會反應。',
    remedy: { label: '試試不同金屬與溶液', link: '/redox?tab=activity' },
  },
  {
    id: 'electrons-through-solution',
    nameZh: '以為電子會經過溶液或鹽橋移動',
    explanation: '電子只在導線（外電路）中流動，從負極流向正極。溶液和鹽橋中移動的是離子，用來維持兩邊電荷平衡。',
    remedy: { label: '看鋅銅電池中電子與離子的移動', link: '/redox?tab=cell' },
  },
  {
    id: 'oxidation-number-is-charge',
    nameZh: '以為氧化數就是原子真正帶的電荷',
    explanation: '氧化數是依規則「假設」電子全歸某一方時的電荷，是記帳工具。{{CO2}} 是共價分子，碳原子並不真的帶 +4 電荷；{{MnO4^-}} 整個離子帶 −1，但 Mn 的氧化數是 +7。',
    remedy: { label: '一步步推算氧化數', link: '/redox?tab=reactions&level=senior' },
  },
  {
    id: 'equilibrium-static',
    nameZh: '以為達到平衡時反應就停止了',
    explanation: '平衡是動態的：正反應和逆反應都還在進行，只是速率相等，所以濃度看起來不再改變。',
    remedy: { label: '看粒子在平衡時仍持續反應', link: '/equilibrium?tab=dynamic' },
  },
  {
    id: 'equal-concentrations',
    nameZh: '以為平衡時反應物與生成物一樣多',
    explanation: '平衡的條件是「正、逆反應速率相等」，不是「濃度相等」。平衡時兩邊的量可以差很多，由平衡常數 K 決定。',
    remedy: { label: '調整正、逆反應的難易度看看', link: '/equilibrium?tab=dynamic' },
  },
  {
    id: 'catalyst-shifts',
    nameZh: '以為催化劑會使平衡移動、增加產量',
    explanation: '催化劑同時加快正反應和逆反應，只會讓系統更快達到平衡，平衡時的組成（產量）不變。',
    remedy: { label: '在合成氨中加入催化劑', link: '/equilibrium?tab=shift&sys=haber' },
  },
  {
    id: 'full-restoration',
    nameZh: '以為平衡移動會把改變完全抵消',
    explanation: '勒沙特列原理說平衡會往「減輕」改變的方向移動，但只能部分抵消。加入 {{NO2}} 後重新平衡，{{NO2}} 仍比加入前多。',
    remedy: { label: '加入 NO₂ 看濃度變化', link: '/equilibrium?tab=shift&sys=no2' },
  },
  {
    id: 'k-changes-with-concentration',
    nameZh: '以為改變濃度或壓力會改變平衡常數 K',
    explanation: '在溫度不變時，K 是定值。改變濃度或壓力只會使 Q 暫時不等於 K，系統再移動到 Q = K。只有溫度會改變 K。',
    remedy: { label: '比較 Q 與 K 的變化', link: '/equilibrium?tab=shift&level=senior' },
  },
  {
    id: 'one-way',
    nameZh: '以為反應只能往一個方向進行',
    explanation: '可逆反應可以往正、逆兩個方向進行。改變條件（例如加酸、加鹼），平衡可以往回移動。',
    remedy: { label: '對鉻酸根溶液加酸、加鹼', link: '/equilibrium?tab=shift&sys=chromate' },
  },
]

export const MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries(list.map((m) => [m.id, m]))
