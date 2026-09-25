import { useEffect, useState } from 'react'
import {
  ANIONS,
  CATIONS,
  compoundFormula,
  evaluate,
  ionChem,
  particleScene,
  type Ion,
  type Outcome,
  type PrecipitationResult,
} from '../../chem/precipitation'
import { Chem, ChemText } from '../../components/Chem'
import { ToolLayout } from '../../components/ToolLayout'
import { Hl } from '../../components/triplet/Highlight'
import { TripletLayout } from '../../components/triplet/TripletLayout'
import { DiagnosticSet } from '../../components/TwoTierQuestion'
import { Button, Callout, Card, CardTitle, Chip, Segmented } from '../../components/ui'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { PRECIPITATION_QUESTIONS } from '../../learning/questions/precipitation'
import { useLearning } from '../../learning/useLearning'
import { useTabParam } from '../../lib/useTabParam'
import { TOOLS } from '../registry'
import { IonMixing, type MixPhase } from './IonMixing'
import { TestTube } from './TestTube'

const OUTCOME_LABEL: Record<Outcome, string> = {
  precipitate: '產生沉澱',
  slight: '微溶（少量沉澱）',
  soluble: '可溶，不反應',
  special: '特殊反應',
}

const OUTCOME_STYLE: Record<Outcome, string> = {
  precipitate: 'bg-accent-soft text-accent',
  slight: 'bg-warn-soft text-warn',
  soluble: 'bg-surface-2 text-ink-2',
  special: 'bg-bad-soft text-bad',
}

const TABS = ['tube', 'matrix', 'quiz'] as const
type Tab = (typeof TABS)[number]

export default function Precipitation() {
  const [tab, setTab] = useTabParam<Tab>(TABS, 'tube')
  const [cation, setCation] = useState<Ion>(CATIONS[3])
  const [anion, setAnion] = useState<Ion>(ANIONS[1])
  const result = evaluate(cation, anion)

  return (
    <ToolLayout meta={TOOLS.precipitation} concepts={<Concepts />}>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'tube', label: '① 試管實驗' },
          { value: 'matrix', label: '② 沉澱表總覽' },
          { value: 'quiz', label: '③ 診斷挑戰' },
        ]}
      />

      {tab === 'tube' && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardTitle>陽離子（來自硝酸鹽溶液）</CardTitle>
              <IonPicker ions={CATIONS} value={cation} onChange={setCation} />
            </Card>
            <Card>
              <CardTitle>陰離子（來自鈉鹽溶液）</CardTitle>
              <IonPicker ions={ANIONS} value={anion} onChange={setAnion} />
            </Card>
          </div>
          <MixExperiment key={`${cation.id}|${anion.id}`} result={result} />
        </>
      )}

      {tab === 'matrix' && (
        <>
          <Card>
            <Matrix
              selected={result}
              onSelect={(c, a) => {
                setCation(c)
                setAnion(a)
              }}
            />
          </Card>
          <ResultCard result={result} />
        </>
      )}

      {tab === 'quiz' && <DiagnosticSet questions={PRECIPITATION_QUESTIONS} />}
    </ToolLayout>
  )
}

/** 化合物中文名：陽離子溶液用硝酸鹽、陰離子溶液用鈉鹽 */
const nitrateName = (c: Ion) => `硝酸${c.nameZh.replace(/根?離子$/, '')}`
function sodiumName(a: Ion): string {
  if (a.id === 'OH-') return '氫氧化鈉'
  if (a.polyatomic) return `${a.nameZh.replace('根', '')}鈉`
  return `${a.nameZh.replace(/離子$/, '')}化鈉`
}

/** 預測 → 混合 → 從巨觀、微觀、符號三個表徵觀察 */
function MixExperiment({ result }: { result: PrecipitationResult }) {
  const [phase, setPhase] = useState<MixPhase>('apart')
  const [prediction, setPrediction] = useState<boolean | null>(null)
  const { store } = useLearning()
  const hasSolid = result.outcome !== 'soluble' && !!result.color
  const nitrate = compoundFormula(result.cation, ANIONS[0]).formula
  const sodium = compoundFormula(CATIONS[0], result.anion).formula

  useEffect(() => {
    if (phase !== 'mixed') return
    const t = setTimeout(() => setPhase('formed'), 1400)
    return () => clearTimeout(t)
  }, [phase])

  const mix = (predicted: boolean | null) => {
    if (predicted !== null) {
      setPrediction(predicted)
      store.record('ion.precipitation', predicted === hasSolid, {
        misconceptionId: predicted && !hasSolid ? 'all-mix-precipitate' : undefined,
        bkt: { guess: 0.5 },
      })
    }
    setPhase('mixed')
  }

  return (
    <>
      <Card className="space-y-3">
        <p className="text-sm font-semibold">
          把 {nitrateName(result.cation)}（<Chem>{nitrate}</Chem>）溶液倒進 {sodiumName(result.anion)}（<Chem>{sodium}</Chem>）溶液，你預測會產生沉澱嗎？
        </p>
        <div className="flex flex-wrap gap-2">
          {phase === 'apart' ? (
            <>
              <Button variant="primary" onClick={() => mix(true)}>
                會產生沉澱
              </Button>
              <Button variant="primary" onClick={() => mix(false)}>
                不會
              </Button>
              <Button variant="ghost" onClick={() => mix(null)}>
                不預測，直接混合
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setPhase('apart')
                setPrediction(null)
              }}
            >
              重來
            </Button>
          )}
        </div>
        {phase === 'formed' && prediction !== null && (
          <Callout tone={prediction === hasSolid ? 'good' : 'bad'}>
            {prediction === hasSolid ? '預測正確！' : hasSolid ? '其實會產生沉澱。' : '其實不會產生沉澱。'}
            {prediction && !hasSolid && (
              <span className="mt-1 block">
                <ChemText>{MISCONCEPTIONS['all-mix-precipitate'].explanation}</ChemText>
              </span>
            )}
          </Callout>
        )}
      </Card>

      <TripletLayout
        macro={
          <div className="flex flex-col items-center gap-2">
            {phase === 'apart' ? <TwoSolutions result={result} nitrate={nitrate} sodium={sodium} /> : <TestTube result={result} />}
            {phase !== 'apart' && (
              <p className="text-center text-xs text-ink-2">
                {result.outcome === 'special'
                  ? `結果：${result.colorName ?? '沒有沉澱'}`
                  : hasSolid
                    ? `出現${result.outcome === 'slight' ? '少量' : ''}${result.colorName}沉澱`
                    : '沒有沉澱，溶液保持澄清'}
              </p>
            )}
          </div>
        }
        micro={
          <div className="space-y-2">
            <IonMixing result={result} phase={phase} />
            <IonLegend result={result} />
            <p className="text-xs text-ink-2">
              {phase === 'apart'
                ? '左：硝酸鹽溶液的離子；右：鈉鹽溶液的離子。'
                : phase === 'mixed'
                  ? '混合中，離子彼此碰撞…'
                  : hasSolid && result.fullEquation
                    ? '結合成固體的離子沉到底部；灰色的旁觀離子仍留在溶液中。'
                    : result.outcome === 'special'
                      ? '這個組合是特殊反應，粒子圖只畫出離子混合。'
                      : '沒有離子結合，全部仍散在水中。'}
            </p>
          </div>
        }
        symbolic={<SymbolicEquations result={result} revealed={phase === 'formed'} />}
      />

      {phase === 'formed' && result.note && (
        <Card>
          <p className="text-sm text-ink-2">{result.note}</p>
        </Card>
      )}
    </>
  )
}

function TwoSolutions({ result, nitrate, sodium }: { result: PrecipitationResult; nitrate: string; sodium: string }) {
  const CLEAR = 'rgba(186, 230, 253, 0.28)'
  const beaker = (x: number, color: string) => (
    <g>
      <rect x={x + 3} y={40} width={54} height={50} fill={color} />
      <path d={`M${x} 20 V88 Q${x} 96 ${x + 8} 96 H${x + 52} Q${x + 60} 96 ${x + 60} 88 V20`} fill="none" stroke="var(--glass)" strokeWidth={2.5} />
    </g>
  )
  return (
    <div className="text-center">
      <svg viewBox="0 0 150 100" className="h-32" role="img" aria-label="兩杯還沒混合的溶液">
        {beaker(5, result.cation.solutionColor ?? CLEAR)}
        {beaker(85, CLEAR)}
      </svg>
      <div className="flex justify-around text-xs">
        <Chem>{nitrate}</Chem>
        <Chem>{sodium}</Chem>
      </div>
    </div>
  )
}

function IonLegend({ result }: { result: PrecipitationResult }) {
  const items = [
    { k: ionChem(result.cation), color: 'var(--series-1)', note: '' },
    { k: ionChem(result.anion), color: 'var(--series-2)', note: '' },
    { k: 'NO3^-', color: '#cbd5e1', note: '旁觀' },
    { k: 'Na^+', color: '#e2e8f0', note: '旁觀' },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 text-xs">
      {items.map((it) => (
        <Hl key={it.k} k={it.k}>
          <span className="mr-1 inline-block size-2.5 rounded-full border border-black/20 align-middle" style={{ background: it.color }} />
          <Chem>{it.k}</Chem>
          {it.note && <span className="ml-0.5 text-ink-2">{it.note}</span>}
        </Hl>
      ))}
    </div>
  )
}

/** 完整反應式 → 完整離子方程式（旁觀離子劃掉）→ 淨離子反應式 */
function SymbolicEquations({ result, revealed }: { result: PrecipitationResult; revealed: boolean }) {
  if (!revealed) return <p className="text-sm text-ink-2">混合後，這裡會顯示反應式。</p>
  const scene = particleScene(result)
  if (!scene.complete) {
    return (
      <div className="space-y-2 text-sm">
        {result.netIonic ? (
          <>
            <div className="text-xs text-ink-2">淨離子反應式</div>
            <div className="rounded-lg bg-surface-2 px-2 py-2 text-center">
              <Chem>{result.netIonic}</Chem>
            </div>
          </>
        ) : (
          <p>
            沒有離子結合成難溶的物質，所以沒有淨反應：四種離子都仍在水中。
          </p>
        )}
      </div>
    )
  }
  const term = (t: { ion: string; coef: number; spectator: boolean }, i: number) => (
    <span key={i}>
      {i > 0 && ' + '}
      <Hl k={t.ion.replace('↓', '')} className={t.spectator ? 'text-ink-2 line-through decoration-bad decoration-2' : 'font-semibold'}>
        <Chem>{`${t.coef > 1 ? t.coef : ''}${t.ion}`}</Chem>
      </Hl>
    </span>
  )
  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="text-xs text-ink-2">① 完整反應式</div>
        <div className="overflow-x-auto">
          <Chem>{result.fullEquation!}</Chem>
        </div>
      </div>
      <div>
        <div className="text-xs text-ink-2">② 寫成離子，兩邊都有的旁觀離子劃掉</div>
        <div className="overflow-x-auto leading-relaxed">
          {scene.complete.left.map(term)} → {scene.complete.right.map(term)}
        </div>
      </div>
      <div>
        <div className="text-xs text-ink-2">③ 淨離子反應式</div>
        <div className="rounded-lg bg-surface-2 px-2 py-2 text-center font-semibold">
          <Chem>{result.netIonic!}</Chem>
        </div>
      </div>
    </div>
  )
}

function IonPicker({ ions, value, onChange }: { ions: Ion[]; value: Ion; onChange: (ion: Ion) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ions.map((ion) => (
        <Chip key={ion.id} active={ion.id === value.id} onClick={() => onChange(ion)} title={ion.nameZh}>
          <Chem>{ionChem(ion)}</Chem>
          <span className="ml-1.5 text-xs opacity-75">{ion.nameZh}</span>
        </Chip>
      ))}
    </div>
  )
}

function ResultCard({ result }: { result: PrecipitationResult }) {
  const { cation, anion, outcome } = result
  const hasSolid = outcome !== 'soluble' && !!result.color
  return (
    <Card>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-lg">
          <Chem>{ionChem(cation)}</Chem> ＋ <Chem>{ionChem(anion)}</Chem>
        </span>
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${OUTCOME_STYLE[outcome]}`}>{OUTCOME_LABEL[outcome]}</span>
      </div>

      {hasSolid ? (
        <div className="mt-3 flex items-center gap-3">
          <span
            className="size-10 shrink-0 rounded-lg border border-line"
            style={{ background: result.color }}
            aria-hidden
          />
          <div>
            <div className="text-xl font-bold">
              <Chem>{result.formula}</Chem> <span className="text-base font-medium">{result.nameZh}</span>
            </div>
            <div className="text-sm text-ink-2">{result.colorName}</div>
          </div>
        </div>
      ) : (
        outcome === 'soluble' && (
          <p className="mt-3 text-sm text-ink-2">
            <Chem>{result.formula}</Chem> 可溶於水，兩種離子仍然各自散布在水中
            {cation.solutionColorName ? `，溶液維持 ${cation.nameZh} 的${cation.solutionColorName}` : '，溶液保持澄清'}。
          </p>
        )
      )}

      {(result.netIonic || result.fullEquation) && (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
          {result.netIonic && (
            <>
              <dt className="text-ink-2">淨離子反應式</dt>
              <dd className="overflow-x-auto font-medium">
                <Chem>{result.netIonic}</Chem>
              </dd>
            </>
          )}
          {result.fullEquation && (
            <>
              <dt className="text-ink-2">完整反應式</dt>
              <dd className="overflow-x-auto">
                <Chem>{result.fullEquation}</Chem>
              </dd>
            </>
          )}
        </dl>
      )}

      {result.note && <p className="mt-3 border-t border-line pt-3 text-sm text-ink-2">{result.note}</p>}
    </Card>
  )
}

function Matrix({ selected, onSelect }: { selected: PrecipitationResult; onSelect: (c: Ion, a: Ion) => void }) {
  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full border-separate border-spacing-1 text-center text-xs sm:text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-surface" />
              {ANIONS.map((a) => (
                <th key={a.id} className="px-1 py-1 font-semibold">
                  <Chem>{ionChem(a)}</Chem>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATIONS.map((c) => (
              <tr key={c.id}>
                <th className="sticky left-0 bg-surface px-1 text-left font-semibold">
                  <Chem>{ionChem(c)}</Chem>
                </th>
                {ANIONS.map((a) => {
                  const r = evaluate(c, a)
                  const isSel = selected.cation.id === c.id && selected.anion.id === a.id
                  return (
                    <td key={a.id} className="p-0">
                      <MatrixCell result={r} selected={isSel} onClick={() => onSelect(c, a)} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        <span>色塊＝沉澱顏色</span>
        <span>格子底色＝溶液顏色</span>
        <span>半透明＝微溶</span>
        <span>
          <b className="text-bad">!</b>＝特殊反應
        </span>
        <span>空白＝可溶</span>
      </div>
    </div>
  )
}

function MatrixCell({ result, selected, onClick }: { result: PrecipitationResult; selected: boolean; onClick: () => void }) {
  const { outcome } = result
  const solid = outcome !== 'soluble' && result.color
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${result.cation.nameZh}與${result.anion.nameZh}：${OUTCOME_LABEL[outcome]}`}
      className={`relative flex h-10 w-full min-w-10 items-center justify-center rounded-md border text-[11px] transition sm:h-12 ${
        selected ? 'border-accent ring-2 ring-accent' : 'border-line hover:border-ink-2'
      }`}
      style={{ background: result.solutionColor ?? (outcome === 'soluble' ? result.cation.solutionColor : undefined) }}
    >
      {solid && (
        <span
          className="absolute inset-1.5 rounded border border-black/20"
          style={{ background: result.color, opacity: outcome === 'slight' ? 0.45 : 1 }}
        />
      )}
      {outcome === 'special' && <span className="absolute top-0 right-1 font-bold text-bad">!</span>}
    </button>
  )
}

function Concepts() {
  return (
    <>
      <p>
        兩種溶液混合時，如果某對陽離子與陰離子結合後<strong>難溶於水</strong>，就會以固體析出，這就是<strong>沉澱</strong>。沒參與沉澱的離子（例如{' '}
        <Chem>Na^+</Chem>、<Chem>NO3^-</Chem>）稱為旁觀離子。
      </p>
      <p>常見規律：</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          含 <Chem>Na^+</Chem>、<Chem>K^+</Chem>、<Chem>NH4^+</Chem>、<Chem>NO3^-</Chem> 的化合物幾乎都可溶。
        </li>
        <li>
          氯化物大多可溶，但 <Chem>AgCl</Chem>（白）、<Chem>PbCl2</Chem>（白）例外。
        </li>
        <li>
          硫酸鹽大多可溶，但 <Chem>BaSO4</Chem>、<Chem>PbSO4</Chem> 沉澱，<Chem>CaSO4</Chem>、<Chem>Ag2SO4</Chem> 微溶。
        </li>
        <li>碳酸鹽、硫化物除了鈉、鉀、銨以外大多沉澱；硫化物多為黑色。</li>
        <li>
          氫氧化物：<Chem>Cu(OH)2</Chem> 藍色、<Chem>Fe(OH)3</Chem> 紅褐色，是檢驗金屬離子的好線索。
        </li>
      </ul>
    </>
  )
}
