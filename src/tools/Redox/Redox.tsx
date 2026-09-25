import { ToolLayout } from '../../components/ToolLayout'
import { DiagnosticSet } from '../../components/TwoTierQuestion'
import { Segmented } from '../../components/ui'
import { REDOX_QUESTIONS } from '../../learning/questions/redox'
import { useTabParam } from '../../lib/useTabParam'
import { TOOLS } from '../registry'
import { Activity } from './Activity'
import { CellView } from './CellView'
import { ReactionAnalysis } from './ReactionAnalysis'

const TABS = ['reactions', 'activity', 'cell', 'quiz'] as const
type Tab = (typeof TABS)[number]

export default function Redox() {
  const [tab, setTab, params] = useTabParam<Tab>(TABS, 'reactions')
  return (
    <ToolLayout meta={TOOLS.redox} concepts={<Concepts />}>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'reactions', label: '① 誰被氧化' },
          { value: 'activity', label: '② 金屬活性' },
          { value: 'cell', label: '③ 電池' },
          { value: 'quiz', label: '④ 診斷挑戰' },
        ]}
      />
      {tab === 'reactions' && <ReactionAnalysis key={params.toString()} params={params} />}
      {tab === 'activity' && <Activity />}
      {tab === 'cell' && <CellView />}
      {tab === 'quiz' && <DiagnosticSet questions={REDOX_QUESTIONS} />}
    </ToolLayout>
  )
}

function Concepts() {
  return (
    <>
      <p>
        國中的定義：物質<strong>得到氧</strong>稱為<strong>氧化</strong>，<strong>失去氧</strong>稱為<strong>還原</strong>。氧化和還原一定同時發生。使別的物質被氧化的叫<strong>氧化劑</strong>（本身被還原），使別的物質被還原的叫<strong>還原劑</strong>（本身被氧化）。
      </p>
      <p>
        金屬的<strong>活性</strong>越大，越容易失去電子。活性大的金屬可以把活性小的金屬從它的離子溶液中置換出來，例如鋅片放進硫酸銅溶液會析出銅。
      </p>
      <p>
        <strong>電池</strong>把氧化還原反應分成兩邊進行：活性大的金屬當負極（失去電子），電子經導線流到正極，溶液和鹽橋中則由離子移動。
      </p>
      <p>高中改用「電子轉移」定義：失去電子、氧化數升高是氧化；得到電子、氧化數降低是還原。沒有氧參與的反應也可能是氧化還原。</p>
    </>
  )
}
