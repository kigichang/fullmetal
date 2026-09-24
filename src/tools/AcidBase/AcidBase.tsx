import { useState } from 'react'
import { acidityLabel, indicatorColor, INDICATORS, rgbaCss, SUBSTANCES, type Indicator } from '../../chem/acidBase'
import { Chem } from '../../components/Chem'
import { ToolLayout } from '../../components/ToolLayout'
import { DiagnosticSet } from '../../components/TwoTierQuestion'
import { Card, CardTitle, Chip, Segmented } from '../../components/ui'
import { ACID_BASE_QUESTIONS } from '../../learning/questions/acidBase'
import { useTabParam } from '../../lib/useTabParam'
import { TOOLS } from '../registry'
import { Neutralization } from './Neutralization'
import { StrengthVsConcentration } from './StrengthVsConcentration'

const TABS = ['scale', 'neutralize', 'strength', 'quiz'] as const
type Tab = (typeof TABS)[number]

export default function AcidBase() {
  const [tab, setTab, params] = useTabParam<Tab>(TABS, 'scale')
  const [indicator, setIndicator] = useState<Indicator>(INDICATORS[3])

  return (
    <ToolLayout meta={TOOLS.acidBase} concepts={<Concepts />}>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'scale', label: '① pH 與指示劑' },
          { value: 'neutralize', label: '② 中和實驗' },
          { value: 'strength', label: '③ 強度與濃度' },
          { value: 'quiz', label: '④ 診斷挑戰' },
        ]}
      />

      {(tab === 'scale' || tab === 'neutralize') && (
      <Card>
        <CardTitle>指示劑</CardTitle>
        <div className="flex flex-wrap gap-2">
          {INDICATORS.map((ind) => (
            <Chip key={ind.id} active={ind.id === indicator.id} onClick={() => setIndicator(ind)}>
              {ind.nameZh}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-2">{indicator.desc}</p>
      </Card>

      )}

      {tab === 'scale' && <PhScale indicator={indicator} />}
      {tab === 'neutralize' && <Neutralization indicator={indicator} />}
      {tab === 'strength' && <StrengthVsConcentration key={params.toString()} params={params} />}
      {tab === 'quiz' && <DiagnosticSet questions={ACID_BASE_QUESTIONS} />}
    </ToolLayout>
  )
}

function PhScale({ indicator }: { indicator: Indicator }) {
  const gradient = Array.from({ length: 57 }, (_, i) => {
    const pH = (i / 56) * 14
    return `${rgbaCss(indicatorColor(pH, indicator))} ${((i / 56) * 100).toFixed(1)}%`
  }).join(', ')

  return (
    <>
      <Card>
        <CardTitle>pH 色帶</CardTitle>
        <div className="relative">
          <div
            className="h-10 rounded-lg border border-line"
            style={{ background: `linear-gradient(to right, ${gradient}), var(--surface)` }}
          />
          <div className="relative mt-1 h-4 font-mono text-[11px] text-ink-2">
            {Array.from({ length: 15 }, (_, pH) => (
              <span key={pH} className="absolute -translate-x-1/2" style={{ left: `${(pH / 14) * 100}%` }}>
                {pH % 2 === 0 || pH === 7 ? pH : ''}
              </span>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs font-semibold">
            <span className="text-bad">← 酸性越強</span>
            <span className="text-good">中性 7</span>
            <span className="text-accent">鹼性越強 →</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>生活中的酸鹼（加入指示劑後的顏色）</CardTitle>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SUBSTANCES.map((s) => (
            <li key={s.nameZh} className="flex items-center gap-3 rounded-lg border border-line p-2">
              <span
                className="h-10 w-5 shrink-0 rounded-b-full border-2 border-t-0 border-glass"
                style={{ background: rgbaCss(indicatorColor(s.pH, indicator)) }}
                aria-hidden
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{s.nameZh}</div>
                <div className="text-xs text-ink-2">
                  pH {s.pH}・{acidityLabel(s.pH)}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-2">pH 為常見參考值，實際數值會因品牌與濃度不同而改變。</p>
      </Card>
    </>
  )
}

function Concepts() {
  return (
    <>
      <p>
        <strong>酸</strong>溶於水會產生氫離子 <Chem>H^+</Chem>，<strong>鹼</strong>溶於水會產生氫氧根離子 <Chem>OH^-</Chem>。pH
        值用來表示酸鹼程度：25°C 時 pH &lt; 7 為酸性、= 7 為中性、&gt; 7 為鹼性。
      </p>
      <p>
        pH 每差 1，<Chem>H^+</Chem> 濃度就差 10 倍。所以 pH 2 的溶液比 pH 4 酸 100 倍。
      </p>
      <p>
        酸鹼的<strong>強度</strong>和<strong>濃度</strong>是兩回事：強酸（如鹽酸）在水中幾乎完全解離，弱酸（如醋酸）只有少部分解離；濃度則是溶了多少。酸性強弱也跟分子裡有幾個 H 無關。
      </p>
      <p>
        石蕊試紙口訣：<strong>藍色石蕊試紙遇酸變紅</strong>、<strong>紅色石蕊試紙遇鹼變藍</strong>。酚酞只在鹼性時變紅，無法分辨酸性與中性。
      </p>
      <p>
        酸與鹼混合會發生<strong>中和反應</strong>：<Chem>{'H^+ + OH^- -> H2O'}</Chem>，同時放出熱量，並生成鹽類（例如 <Chem>NaCl</Chem>）。
      </p>
    </>
  )
}
