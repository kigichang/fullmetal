import { useState } from 'react'
import { ANIONS, CATIONS, evaluate, ionChem, type Ion, type Outcome, type PrecipitationResult } from '../../chem/precipitation'
import { Chem } from '../../components/Chem'
import { ToolLayout } from '../../components/ToolLayout'
import { Card, CardTitle, Chip, Segmented } from '../../components/ui'
import { TOOLS } from '../registry'
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

type Mode = 'tube' | 'matrix'

export default function Precipitation() {
  const [mode, setMode] = useState<Mode>('tube')
  const [cation, setCation] = useState<Ion>(CATIONS[3])
  const [anion, setAnion] = useState<Ion>(ANIONS[1])
  const result = evaluate(cation, anion)

  return (
    <ToolLayout meta={TOOLS.precipitation} concepts={<Concepts />}>
      <Segmented<Mode>
        value={mode}
        onChange={setMode}
        options={[
          { value: 'tube', label: '試管實驗' },
          { value: 'matrix', label: '沉澱表總覽' },
        ]}
      />

      {mode === 'tube' ? (
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <Card>
            <CardTitle>陽離子（來自硝酸鹽溶液）</CardTitle>
            <IonPicker ions={CATIONS} value={cation} onChange={setCation} />
          </Card>
          <Card className="flex items-center justify-center md:w-52">
            <TestTube result={result} />
          </Card>
          <Card>
            <CardTitle>陰離子（來自鈉鹽溶液）</CardTitle>
            <IonPicker ions={ANIONS} value={anion} onChange={setAnion} />
          </Card>
        </div>
      ) : (
        <Card>
          <Matrix
            selected={result}
            onSelect={(c, a) => {
              setCation(c)
              setAnion(a)
            }}
          />
        </Card>
      )}

      <ResultCard result={result} />
    </ToolLayout>
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
