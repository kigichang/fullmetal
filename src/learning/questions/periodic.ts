import type { TwoTierQuestion } from '../twoTier'

export const PERIODIC_QUESTIONS: TwoTierQuestion[] = [
  {
    id: 'pt-j1',
    concept: 'pt.structure',
    level: 'junior',
    stem: '鈉（電子排列 2, 8, 1）和鉀（2, 8, 8, 1）的化學性質很相似，主要原因是什麼？',
    options: [
      { text: '最外層都只有 1 個電子', correct: true },
      { text: '電子層數相同' },
      { text: '原子量很接近', misconception: 'group-by-mass' },
      { text: '都在同一個週期', misconception: 'same-period-same-properties' },
    ],
    reasons: [
      { text: '同一族的元素最外層電子數相同，所以化學性質相似', correct: true },
      { text: '同一橫列（週期）的元素性質相似', misconception: 'same-period-same-properties' },
      { text: '原子量越接近，性質越相似', misconception: 'group-by-mass' },
      { text: '兩者都是金屬，所有金屬性質都相同' },
    ],
  },
  {
    id: 'pt-j2',
    concept: 'pt.structure',
    level: 'junior',
    stem: '鉀的原子序是 19。依國中課本的規則，鉀的電子排列是？',
    options: [
      { text: '2, 8, 8, 1', correct: true },
      { text: '2, 8, 9', misconception: 'fill-by-shell-order' },
      { text: '2, 8, 1, 8' },
      { text: '2, 9, 8' },
    ],
    reasons: [
      { text: '前 20 號元素每層依序最多 2、8、8 個，第三層放滿 8 個後，第 19 個電子進入第四層', correct: true },
      { text: '第三層可以放更多電子，要先把第三層填滿才能放第四層', misconception: 'fill-by-shell-order' },
      { text: '最外層的電子數要等於週期數' },
    ],
  },
  {
    id: 'pt-j3',
    concept: 'pt.structure',
    level: 'junior',
    stem: '氧位於第 2 週期、第 16 族。氧原子有幾個電子層？最外層有幾個電子？',
    options: [
      { text: '2 層，最外層 6 個', correct: true },
      { text: '16 層，最外層 2 個' },
      { text: '2 層，最外層 16 個' },
      { text: '6 層，最外層 2 個' },
    ],
    reasons: [
      { text: '主族元素的週期數等於電子層數；第 16 族最外層有 6 個電子（族號減 10）', correct: true },
      { text: '族的號碼就是最外層的電子數' },
      { text: '週期數等於最外層電子數' },
    ],
  },
  {
    id: 'pt-j4',
    concept: 'pt.group-trend',
    level: 'junior',
    stem: '把同樣大小的鋰、鈉、鉀分別放入水中，哪一個反應最劇烈？',
    options: [
      { text: '鉀', correct: true },
      { text: '鋰' },
      { text: '鈉' },
      { text: '三者一樣劇烈' },
    ],
    reasons: [
      { text: '同族由上到下，最外層電子離原子核越遠，越容易失去，所以越活潑', correct: true },
      { text: '原子越小，越容易失去電子' },
      { text: '同一族的性質完全相同，所以反應一樣劇烈' },
    ],
  },
  {
    id: 'pt-j5',
    concept: 'pt.structure',
    level: 'junior',
    stem: '現代週期表中，元素是依照什麼排列順序的？',
    options: [
      { text: '原子序（質子數）', correct: true },
      { text: '原子量', misconception: 'group-by-mass' },
      { text: '發現的年代' },
      { text: '元素英文名稱的字母順序' },
    ],
    reasons: [
      { text: '依原子序排列；例如碲的原子量比碘大，卻排在碘的前面', correct: true },
      { text: '元素依原子量由小到大排列', misconception: 'group-by-mass' },
      { text: '越早發現的元素排在越前面' },
    ],
  },
  {
    id: 'pt-s1',
    concept: 'pt.trends',
    level: 'senior',
    stem: '第 3 週期由鈉到氯，原子半徑如何變化？',
    options: [
      { text: '逐漸變小', correct: true },
      { text: '逐漸變大', misconception: 'bigger-z-bigger-atom' },
      { text: '幾乎不變' },
    ],
    reasons: [
      { text: '電子層數相同，但核電荷增加，對外層電子的吸引力變強', correct: true },
      { text: '電子數越多，原子就越大', misconception: 'bigger-z-bigger-atom' },
      { text: '同一週期的原子大小都一樣' },
    ],
  },
  {
    id: 'pt-s2',
    concept: 'pt.trends',
    level: 'senior',
    stem: 'Mg 的第一游離能是 738 kJ/mol，Al 是 578 kJ/mol。Al 的原子序比較大，游離能反而比較小，主要原因是什麼？',
    options: [
      { text: 'Al 要移去的是 3p 電子，能量較高、較容易移去', correct: true },
      { text: 'Al 的原子比 Mg 大', misconception: 'bigger-z-bigger-atom' },
      { text: '只是測量誤差' },
    ],
    reasons: [
      { text: '3p 電子的能量比 3s 高，又受到 3s 電子遮蔽，比較容易移去', correct: true },
      { text: '原子序越大，原子越大，電子就越容易移去', misconception: 'bigger-z-bigger-atom' },
      { text: '同一週期由左到右，游離能一定逐漸變大，所以數據有誤' },
    ],
  },
  {
    id: 'pt-s3',
    concept: 'pt.orbitals',
    level: 'senior',
    stem: '鉻（Cr，原子序 24）的基態電子組態是？',
    options: [
      { text: '[Ar] 3d⁵ 4s¹', correct: true },
      { text: '[Ar] 3d⁴ 4s²' },
      { text: '[Ar] 3d⁶', misconception: 'fill-by-shell-order' },
    ],
    reasons: [
      { text: '半填滿的 3d⁵ 比較穩定，所以一個 4s 電子移到 3d', correct: true },
      { text: '一定要依照填入順序，先填滿 4s 才能填 3d' },
      { text: '3d 屬於第 3 層，一定要比第 4 層先填滿', misconception: 'fill-by-shell-order' },
    ],
  },
  {
    id: 'pt-s4',
    concept: 'pt.orbitals',
    level: 'senior',
    stem: '關於原子中的電子，下列哪一個描述比較正確？',
    options: [
      { text: '電子沒有固定路徑，軌域描述的是電子出現的機率分布', correct: true },
      { text: '電子沿著固定的圓形軌道繞原子核運轉', misconception: 'bohr-orbits-real' },
      { text: '電子靜止在原子核外的固定位置' },
    ],
    reasons: [
      { text: '波耳模型能解釋能階，但電子沒有確定的軌跡；量子力學用軌域表示電子出現的機率', correct: true },
      { text: '課本畫的同心圓就是電子真正的軌道', misconception: 'bohr-orbits-real' },
      { text: '電子受原子核吸引，所以固定不動' },
    ],
  },
]
