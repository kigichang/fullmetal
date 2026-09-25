import { useState } from 'react'
import { galvanicCell, METALS, type Metal } from '../../chem/redox'
import { Chem } from '../../components/Chem'
import { Hl } from '../../components/triplet/Highlight'
import { TripletLayout } from '../../components/triplet/TripletLayout'
import { Callout, Card, CardTitle, Chip } from '../../components/ui'
import { useLearning } from '../../learning/useLearning'

/** 兩種金屬組成的電池（例如鋅銅電池）：電子走導線、離子走鹽橋 */
export function CellView() {
  const [left, setLeft] = useState<Metal>(METALS[1])
  const [right, setRight] = useState<Metal>(METALS[4])
  const [prediction, setPrediction] = useState<string | null>(null)
  const { store } = useLearning()
  const cell = galvanicCell(left, right)

  const choose = (setter: (m: Metal) => void, m: Metal) => {
    setter(m)
    setPrediction(null)
  }

  const predict = (symbol: string) => {
    if (!cell || prediction !== null) return
    setPrediction(symbol)
    store.record('redox.cell', symbol === cell.anode.symbol, { bkt: { guess: 0.5 } })
  }

  const revealed = prediction !== null

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { side: '左邊', value: left, set: setLeft },
            { side: '右邊', value: right, set: setRight },
          ].map(({ side, value, set }) => (
            <div key={side}>
              <CardTitle>
                {side}的電極（插在自己的離子溶液中）
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {METALS.map((m) => (
                  <Chip key={m.symbol} active={m.symbol === value.symbol} onClick={() => choose(set, m)}>
                    {m.nameZh} <Chem>{m.symbol}</Chem>
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
        {!cell ? (
          <Callout tone="info">兩邊用同一種金屬時，沒有電位差，不會產生電流。請選兩種不同的金屬。</Callout>
        ) : (
          <div className="border-t border-line pt-4">
            <p className="text-sm font-semibold">接上導線後，電子會從哪一個電極流出？</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[left, right].map((m) => (
                <Chip key={m.symbol} active={prediction === m.symbol} onClick={() => predict(m.symbol)}>
                  {m.nameZh}電極
                </Chip>
              ))}
              {!revealed && (
                <button type="button" className="text-sm text-ink-2 underline underline-offset-4" onClick={() => setPrediction('')}>
                  直接看
                </button>
              )}
            </div>
            {prediction && (
              <div className="mt-3">
                <Callout tone={prediction === cell.anode.symbol ? 'good' : 'bad'}>
                  {prediction === cell.anode.symbol
                    ? '答對了！'
                    : `電子從${cell.anode.nameZh}流出：${cell.anode.nameZh}比${cell.cathode.nameZh}活潑，比較容易失去電子。`}
                </Callout>
              </div>
            )}
          </div>
        )}
      </Card>

      {cell && (
        <TripletLayout
          macro={<CellDiagram left={left} right={right} anode={cell.anode.symbol} voltage={cell.voltage} animate={revealed} />}
          micro={<ElectrodeZoom anode={cell.anode} cathode={cell.cathode} revealed={revealed} />}
          symbolic={<CellSymbolic cell={cell} revealed={revealed} />}
        />
      )}
      {cell && revealed && (
        <Callout tone="info">
          電子只在<strong>導線</strong>中流動（負極 → 正極）；溶液與鹽橋中移動的是<strong>離子</strong>：陰離子移向負極、陽離子移向正極，讓兩杯溶液保持電中性。
        </Callout>
      )}
    </div>
  )
}

function CellDiagram({ left, right, anode, voltage, animate }: { left: Metal; right: Metal; anode: string; voltage: number; animate: boolean }) {
  const leftIsAnode = left.symbol === anode
  const wire = leftIsAnode ? 'M41 70 V20 H179 V70' : 'M179 70 V20 H41 V70'
  // SVG 的 animateMotion 不受 CSS 的減少動態設定影響，需自行判斷
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const moving = animate && !reduceMotion
  const bridge = 'M80 120 V70 H140 V120'
  const toAnode = leftIsAnode ? 'M140 110 V70 H80 V110' : 'M80 110 V70 H140 V110'
  const toCathode = leftIsAnode ? 'M80 110 V70 H140 V110' : 'M140 110 V70 H80 V110'
  const beaker = (x: number, m: Metal) => (
    <g>
      <rect x={x} y={95} width={70} height={60} fill={m.solution.color} />
      <path d={`M${x} 80 V150 Q${x} 158 ${x + 8} 158 H${x + 62} Q${x + 70} 158 ${x + 70} 150 V80`} fill="none" stroke="var(--glass)" strokeWidth={2.5} />
      <rect x={x + 25} y={70} width={12} height={78} fill={m.color} stroke="rgba(0,0,0,0.3)" />
    </g>
  )
  return (
    <div className="space-y-1">
      <svg viewBox="0 0 220 175" className="w-full" role="img" aria-label={`電子由${leftIsAnode ? left.nameZh : right.nameZh}經導線流向另一極，電壓 ${voltage} 伏特`}>
        {beaker(10, left)}
        {beaker(140, right)}
        <path d={bridge} fill="none" stroke="var(--ink-2)" strokeWidth={10} strokeOpacity={0.25} strokeLinecap="round" />
        <text x={110} y={66} textAnchor="middle" fontSize={8} fill="var(--ink-2)">
          鹽橋
        </text>
        <path d="M41 70 V20 H179 V70" fill="none" stroke="var(--ink)" strokeWidth={1.5} />
        <text x={41} y={172} textAnchor="middle" fontSize={8} fill="var(--ink)">
          {leftIsAnode ? '負極（氧化）' : '正極（還原）'}
        </text>
        <text x={181} y={172} textAnchor="middle" fontSize={8} fill="var(--ink)">
          {leftIsAnode ? '正極（還原）' : '負極（氧化）'}
        </text>
        {moving &&
          [0, 1, 2].map((i) => (
            <g key={`e${i}`}>
              <circle r={4} fill="var(--accent)">
                <animateMotion dur="3s" begin={`${i}s`} repeatCount="indefinite" path={wire} />
              </circle>
            </g>
          ))}
        {moving &&
          [0, 1].map((i) => (
            <g key={`ion${i}`}>
              <circle r={3.5} fill="var(--series-1)">
                <animateMotion dur="4s" begin={`${i * 2}s`} repeatCount="indefinite" path={toAnode} />
              </circle>
              <circle r={3.5} fill="var(--series-2)">
                <animateMotion dur="4s" begin={`${i * 2 + 1}s`} repeatCount="indefinite" path={toCathode} />
              </circle>
            </g>
          ))}
        {/* 電壓計畫在最上層，避免被移動中的電子蓋住 */}
        <circle cx={110} cy={20} r={13} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.5} />
        <text x={110} y={23} textAnchor="middle" fontSize={8} fontWeight={700} fill="var(--ink)">
          {voltage.toFixed(2)}V
        </text>
      </svg>
      {animate && (
        <div className="flex flex-wrap justify-center gap-x-3 text-xs">
          <Hl k="e">
            <span className="mr-1 inline-block size-2.5 rounded-full align-middle" style={{ background: 'var(--accent)' }} />
            電子（導線中）
          </Hl>
          <span>
            <span className="mr-1 inline-block size-2.5 rounded-full align-middle" style={{ background: 'var(--series-1)' }} />
            陰離子 → 負極
          </span>
          <span>
            <span className="mr-1 inline-block size-2.5 rounded-full align-middle" style={{ background: 'var(--series-2)' }} />
            陽離子 → 正極
          </span>
        </div>
      )}
    </div>
  )
}

function ElectrodeZoom({ anode, cathode, revealed }: { anode: Metal; cathode: Metal; revealed: boolean }) {
  if (!revealed) return <p className="text-sm text-ink-2">先預測電子從哪裡流出，再看電極表面發生什麼事。</p>
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-lg border border-line p-3">
        <div className="font-semibold">負極：{anode.nameZh}</div>
        <p className="text-ink-2">
          {anode.nameZh}原子失去電子，變成 <Chem>{anode.ion}</Chem> 進入溶液，所以{anode.nameZh}片會慢慢變薄。
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs">
          <Dot label={anode.symbol} color="var(--series-4)" /> → <Dot label={`${anode.symbol}${anode.charge > 1 ? '²⁺' : '⁺'}`} color="var(--series-2)" /> +{' '}
          <Hl k="e">{anode.charge} e⁻</Hl>
        </div>
      </div>
      <div className="rounded-lg border border-line p-3">
        <div className="font-semibold">正極：{cathode.nameZh}</div>
        <p className="text-ink-2">
          溶液中的 <Chem>{cathode.ion}</Chem> 在電極表面得到電子，變成{cathode.nameZh}附著上去，所以{cathode.nameZh}片會變厚。
        </p>
        <div className="mt-2 flex items-center gap-1 text-xs">
          <Dot label={`${cathode.symbol}${cathode.charge > 1 ? '²⁺' : '⁺'}`} color="var(--series-1)" /> + <Hl k="e">{cathode.charge} e⁻</Hl> →{' '}
          <Dot label={cathode.symbol} color="var(--series-3)" />
        </div>
      </div>
    </div>
  )
}

function Dot({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[9px] font-semibold text-white" style={{ background: color }}>
      {label}
    </span>
  )
}

function CellSymbolic({ cell, revealed }: { cell: NonNullable<ReturnType<typeof galvanicCell>>; revealed: boolean }) {
  const { anode, cathode } = cell
  if (!revealed) return <p className="text-sm text-ink-2">預測後會顯示半反應與電壓。</p>
  return (
    <div className="space-y-2 text-sm">
      <div className="text-xs">
        <span className="text-bad">負極（氧化）</span>：<Chem>{`${anode.symbol} -> ${anode.ion} + ${anode.charge > 1 ? anode.charge : ''}e^-`}</Chem>
      </div>
      <div className="text-xs">
        <span className="text-accent">正極（還原）</span>：<Chem>{`${cathode.ion} + ${cathode.charge > 1 ? cathode.charge : ''}e^- -> ${cathode.symbol}`}</Chem>
      </div>
      <div className="rounded-lg bg-surface-2 px-2 py-2 text-center">
        <Chem>{cell.overall}</Chem>
      </div>
      <div className="rounded-lg border border-line p-2 font-mono text-xs">
        <div>
          E°（正極 {cathode.symbol}）= {volts(cathode.e0)} V
        </div>
        <div>
          E°（負極 {anode.symbol}）= {volts(anode.e0)} V
        </div>
        <div className="font-sans font-semibold">電池電壓 = {cell.voltage.toFixed(2)} V</div>
        <div className="font-sans text-ink-2">（高中：E°電池 = E°正極 − E°負極；兩種金屬活性差越大，電壓越大）</div>
      </div>
    </div>
  )
}

const volts = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}`
