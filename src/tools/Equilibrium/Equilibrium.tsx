import { Chem } from '../../components/Chem'
import { ToolLayout } from '../../components/ToolLayout'
import { DiagnosticSet } from '../../components/TwoTierQuestion'
import { Segmented } from '../../components/ui'
import { EQUILIBRIUM_QUESTIONS } from '../../learning/questions/equilibrium'
import { useTabParam } from '../../lib/useTabParam'
import { TOOLS } from '../registry'
import { DynamicEquilibrium } from './DynamicEquilibrium'
import { LeChatelier } from './LeChatelier'

const TABS = ['dynamic', 'shift', 'quiz'] as const
type Tab = (typeof TABS)[number]

export default function Equilibrium() {
  const [tab, setTab, params] = useTabParam<Tab>(TABS, 'dynamic')
  return (
    <ToolLayout meta={TOOLS.equilibrium} concepts={<Concepts />}>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'dynamic', label: '① 動態平衡' },
          { value: 'shift', label: '② 平衡移動' },
          { value: 'quiz', label: '③ 診斷挑戰' },
        ]}
      />
      {tab === 'dynamic' && <DynamicEquilibrium />}
      {tab === 'shift' && <LeChatelier key={params.toString()} params={params} />}
      {tab === 'quiz' && <DiagnosticSet questions={EQUILIBRIUM_QUESTIONS} />}
    </ToolLayout>
  )
}

function Concepts() {
  return (
    <>
      <p>
        <strong>可逆反應</strong>可以往正、逆兩個方向進行，用 <Chem>{'<=>'}</Chem> 表示。在密閉容器中，正反應和逆反應的速率最後會相等，各物質的濃度不再改變，稱為<strong>化學平衡</strong>。
      </p>
      <p>
        平衡是<strong>動態</strong>的：反應並沒有停止，只是兩個方向一樣快。平衡時反應物和生成物也不一定一樣多。
      </p>
      <p>
        <strong>勒沙特列原理</strong>：改變平衡系統的條件（濃度、壓力、溫度），平衡會往「減輕這個改變」的方向移動，但只能部分抵消。催化劑不會使平衡移動。
      </p>
      <p>高中會用平衡常數 K 與反應商 Q 來判斷：Q &lt; K 向右、Q &gt; K 向左；只有溫度會改變 K。</p>
    </>
  )
}
