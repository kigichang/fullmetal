import { ToolLayout } from '../../components/ToolLayout'
import { DiagnosticSet } from '../../components/TwoTierQuestion'
import { Segmented } from '../../components/ui'
import { PERIODIC_QUESTIONS } from '../../learning/questions/periodic'
import { useTabParam } from '../../lib/useTabParam'
import { TOOLS } from '../registry'
import { Inquiry } from './Inquiry'
import { Orbitals } from './Orbitals'
import { TableExplorer } from './TableExplorer'

const TABS = ['inquiry', 'table', 'orbitals', 'quiz'] as const
type Tab = (typeof TABS)[number]

export default function PeriodicTable() {
  const [tab, setTab, params] = useTabParam<Tab>(TABS, 'inquiry')
  return (
    <ToolLayout meta={TOOLS.periodicTable} concepts={<Concepts />}>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'inquiry', label: '① 探究任務' },
          { value: 'table', label: '② 查詢' },
          { value: 'orbitals', label: '③ 電子排列與軌域' },
          { value: 'quiz', label: '④ 診斷挑戰' },
        ]}
      />
      {tab === 'inquiry' && <Inquiry key={params.toString()} params={params} />}
      {tab === 'table' && <TableExplorer />}
      {tab === 'orbitals' && <Orbitals key={params.toString()} params={params} />}
      {tab === 'quiz' && <DiagnosticSet questions={PERIODIC_QUESTIONS} />}
    </ToolLayout>
  )
}

function Concepts() {
  return (
    <>
      <p>
        週期表依<strong>原子序</strong>（質子數）由小到大排列。橫列稱為<strong>週期</strong>（共 7 個），直行稱為<strong>族</strong>（共 18 族）。
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>主族元素（第 1、2、13–18 族）中，同一族的最外層電子數相同，所以化學性質相似。例如第 1 族的鋰、鈉、鉀都很活潑，遇水會產生氫氣。</li>
        <li>主族元素的週期數 = 電子層數。例如鈉（2, 8, 1）有 3 層，位在第 3 週期。</li>
        <li>金屬大多在左邊與中間，非金屬在右上方，交界處是性質介於兩者之間的類金屬。</li>
        <li>第 17 族稱為鹵素，第 18 族是鈍氣（惰性氣體），最外層電子已經填滿，很難發生反應。</li>
      </ul>
      <p>國中重點是前 20 號元素的符號、名稱與電子排列；「電子組態」是高中才會學的寫法，先看看就好。</p>
      <p>建議順序：先在「探究任務」自己從數據找出規律，再用「查詢」檢查，最後用「診斷挑戰」確認觀念。</p>
    </>
  )
}
