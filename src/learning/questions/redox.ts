import type { TwoTierQuestion } from '../twoTier'

export const REDOX_QUESTIONS: TwoTierQuestion[] = [
  {
    id: 'redox-j1',
    concept: 'redox.oxygen',
    level: 'junior',
    stem: '在 {{CuO + H2 -> Cu + H2O}} 中，哪一個物質被氧化？',
    options: [
      { text: '{{H2}}', correct: true },
      { text: '{{CuO}}', misconception: 'contains-o-is-oxidized' },
      { text: '{{Cu}}' },
      { text: '{{H2O}}' },
    ],
    reasons: [
      { text: '{{H2}} 得到氧變成 {{H2O}}，得到氧就是被氧化', correct: true },
      { text: '{{CuO}} 含有氧，所以它是被氧化的物質', misconception: 'contains-o-is-oxidized' },
      { text: '{{H2}} 是還原劑，還原劑本身被還原', misconception: 'agent-confusion' },
      { text: '產物才會被氧化，反應物不會' },
    ],
  },
  {
    id: 'redox-j2',
    concept: 'redox.activity',
    level: 'junior',
    stem: '把銅片放進無色的硫酸鋅溶液中，一段時間後會看到什麼？',
    options: [
      { text: '沒有明顯變化', correct: true },
      { text: '銅片表面析出灰色的鋅', misconception: 'less-active-displaces' },
      { text: '溶液變成藍色', misconception: 'less-active-displaces' },
      { text: '產生大量氫氣' },
    ],
    reasons: [
      { text: '銅的活性比鋅小，無法把鋅離子還原成鋅', correct: true },
      { text: '金屬放進任何金屬離子溶液都會發生置換', misconception: 'less-active-displaces' },
      { text: '銅會溶解成銅離子，同時析出鋅', misconception: 'less-active-displaces' },
      { text: '硫酸會和銅反應產生氫氣' },
    ],
  },
  {
    id: 'redox-j3',
    concept: 'redox.activity',
    level: 'junior',
    stem: '把鋅片放進藍色的硫酸銅溶液中，一段時間後，下列敘述何者正確？',
    options: [
      { text: '鋅片表面出現紅色的銅，溶液藍色變淡', correct: true },
      { text: '鋅片表面出現紅色的銅，溶液藍色變深' },
      { text: '沒有任何變化', misconception: 'less-active-displaces' },
      { text: '溶液變成紅色' },
    ],
    reasons: [
      { text: '鋅失去電子變成鋅離子，銅離子得到電子變成銅，溶液中的銅離子減少', correct: true },
      { text: '鋅比銅不活潑，所以不會反應', misconception: 'less-active-displaces' },
      { text: '鋅離子是藍色的，所以溶液更藍' },
      { text: '銅離子會變成紅色的溶液' },
    ],
  },
  {
    id: 'redox-j4',
    concept: 'redox.cell',
    level: 'junior',
    stem: '鋅銅電池（鋅片插在硫酸鋅溶液、銅片插在硫酸銅溶液，中間接鹽橋）工作時，電子如何流動？',
    options: [
      { text: '從鋅片經導線流到銅片', correct: true },
      { text: '從銅片經導線流到鋅片' },
      { text: '從鋅片經過溶液和鹽橋流到銅片', misconception: 'electrons-through-solution' },
      { text: '電池裡沒有電子移動' },
    ],
    reasons: [
      { text: '鋅比較活潑，失去電子；電子經外電路的導線流向銅片', correct: true },
      { text: '電子會穿過溶液與鹽橋，回到另一個電極', misconception: 'electrons-through-solution' },
      { text: '銅是正極，電子從正極流出' },
      { text: '電池只靠離子導電，沒有電子流動' },
    ],
  },
  {
    id: 'redox-j5',
    concept: 'redox.oxygen',
    level: 'junior',
    stem: '鎂帶在空氣中燃燒生成氧化鎂（{{2Mg + O2 -> 2MgO}}），氧氣在這個反應中扮演什麼角色？',
    options: [
      { text: '氧化劑', correct: true },
      { text: '還原劑', misconception: 'agent-confusion' },
      { text: '催化劑' },
      { text: '不參與反應' },
    ],
    reasons: [
      { text: '氧氣使鎂被氧化，氧氣本身被還原，所以是氧化劑', correct: true },
      { text: '氧氣本身被氧化，所以是還原劑', misconception: 'agent-confusion' },
      { text: '氧氣只是幫助燃燒，反應前後沒有改變' },
    ],
  },
  {
    id: 'redox-s1',
    concept: 'redox.oxidation-number',
    level: 'senior',
    stem: '{{Zn + Cu^2+ -> Zn^2+ + Cu}} 是氧化還原反應嗎？',
    options: [
      { text: '是，Zn 被氧化', correct: true },
      { text: '不是，因為沒有氧參與', misconception: 'oxidation-needs-oxygen' },
      { text: '是，{{Cu^2+}} 被氧化', misconception: 'reduction-loses-electrons' },
      { text: '不是，這只是置換反應' },
    ],
    reasons: [
      { text: 'Zn 的氧化數由 0 升為 +2，Cu 由 +2 降為 0，有電子轉移', correct: true },
      { text: '氧化還原一定要有氧參與', misconception: 'oxidation-needs-oxygen' },
      { text: '{{Cu^2+}} 得到電子，得到電子就是被氧化', misconception: 'reduction-loses-electrons' },
      { text: '置換反應和氧化還原是兩種不同的反應' },
    ],
  },
  {
    id: 'redox-s2',
    concept: 'redox.oxidation-number',
    level: 'senior',
    stem: '{{KMnO4}} 中 Mn 的氧化數是多少？',
    options: [
      { text: '+7', correct: true },
      { text: '+4' },
      { text: '−1', misconception: 'oxidation-number-is-charge' },
      { text: '+2' },
    ],
    reasons: [
      { text: 'K 為 +1、O 為 −2，總和為 0：(+1) + Mn + 4×(−2) = 0', correct: true },
      { text: '過錳酸根帶 −1 電荷，所以 Mn 是 −1', misconception: 'oxidation-number-is-charge' },
      { text: 'Mn 是金屬，金屬的氧化數都是 +2' },
    ],
  },
  {
    id: 'redox-s3',
    concept: 'redox.oxidation-number',
    level: 'senior',
    stem: '{{CO2}} 中 C 的氧化數為 +4。這代表什麼意思？',
    options: [
      { text: '是依規則分配電子得到的數字，C 並不真的帶 +4 電荷', correct: true },
      { text: 'C 原子真的帶 4 個正電荷', misconception: 'oxidation-number-is-charge' },
      { text: '{{CO2}} 是離子化合物' },
    ],
    reasons: [
      { text: '{{CO2}} 是共價分子；氧化數是假設共用電子全歸電負度大的原子時的電荷', correct: true },
      { text: '氧化數就是原子實際帶的電荷', misconception: 'oxidation-number-is-charge' },
      { text: '只有離子化合物才有氧化數' },
    ],
  },
]
