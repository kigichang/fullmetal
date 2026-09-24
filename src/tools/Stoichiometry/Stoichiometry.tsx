import { Chem } from '../../components/Chem'
import { ToolLayout } from '../../components/ToolLayout'
import { DiagnosticSet } from '../../components/TwoTierQuestion'
import { Segmented } from '../../components/ui'
import { MOLE_QUESTIONS } from '../../learning/questions/mole'
import { useTabParam } from '../../lib/useTabParam'
import { TOOLS } from '../registry'
import { MassMoles } from './MassMoles'
import { ParticlePairing } from './ParticlePairing'

const TABS = ['pairing', 'mass', 'quiz'] as const
type Tab = (typeof TABS)[number]

export default function Stoichiometry() {
  const [tab, setTab] = useTabParam<Tab>(TABS, 'pairing')
  return (
    <ToolLayout meta={TOOLS.stoichiometry} concepts={<Concepts />}>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'pairing', label: '① 粒子配對' },
          { value: 'mass', label: '② 質量與莫耳' },
          { value: 'quiz', label: '③ 診斷挑戰' },
        ]}
      />
      {tab === 'pairing' && <ParticlePairing />}
      {tab === 'mass' && <MassMoles />}
      {tab === 'quiz' && <DiagnosticSet questions={MOLE_QUESTIONS} />}
    </ToolLayout>
  )
}

function Concepts() {
  return (
    <>
      <p>
        <strong>莫耳</strong>是「一堆」粒子的單位：1 莫耳 = 6×10²³ 個粒子。1 莫耳物質的質量（克）在數值上等於它的分子量，所以{' '}
        <strong>莫耳數 = 質量 ÷ 分子量</strong>。
      </p>
      <p>
        反應式的<strong>係數比 = 莫耳數比 = 分子個數比</strong>，但<strong>不等於質量比</strong>。例如{' '}
        <Chem>{'2H2 + O2 -> 2H2O'}</Chem>：2 莫耳氫氣配 1 莫耳氧氣，質量卻是 4 克配 32 克。
      </p>
      <p>
        兩種反應物不一定剛好用完。把各自的莫耳數除以係數，<strong>比值較小的先用完</strong>，稱為限量試劑；它決定了產物最多能生成多少。另一種會剩下，稱為過量試劑。
      </p>
      <p>建議順序：先在「粒子配對」用個數想清楚，再到「質量與莫耳」練習換算，最後用「診斷挑戰」檢查自己是不是真的懂。</p>
    </>
  )
}
