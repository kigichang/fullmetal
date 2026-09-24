import { Fragment, useState } from 'react'
import { atomLedger, hintElement, isBalanced, isSimplest, sideMasses } from '../../chem/balance'
import { getElement } from '../../chem/elements'
import { LEVEL_LABEL, REACTIONS, type Level, type Reaction } from '../../chem/equations'
import { molarMass } from '../../chem/formula'
import { Chem } from '../../components/Chem'
import { AtomLegend, Molecule } from '../../components/Molecule'
import { ToolLayout } from '../../components/ToolLayout'
import { Button, Callout, Card, CardTitle, Chip } from '../../components/ui'
import { TOOLS } from '../registry'

const MAX_COEF = 12
const LEVELS: Level[] = ['easy', 'medium', 'hard']

export default function Balancer() {
  const [reaction, setReaction] = useState<Reaction>(REACTIONS[0])
  const [coeffs, setCoeffs] = useState<number[]>(() => REACTIONS[0].coefficients.map(() => 1))
  const [showHint, setShowHint] = useState(false)

  const pick = (r: Reaction) => {
    setReaction(r)
    setCoeffs(r.coefficients.map(() => 1))
    setShowHint(false)
  }

  const setCoef = (idx: number, delta: number) => {
    setCoeffs((cs) => cs.map((c, i) => (i === idx ? Math.min(MAX_COEF, Math.max(1, c + delta)) : c)))
    setShowHint(false)
  }

  const ledger = atomLedger(reaction, coeffs)
  const balanced = isBalanced(reaction, coeffs)
  const simplest = isSimplest(coeffs)
  const masses = sideMasses(reaction, coeffs)
  const hint = hintElement(reaction, coeffs)
  const nR = reaction.reactants.length
  const species = [...reaction.reactants, ...reaction.products]

  return (
    <ToolLayout meta={TOOLS.balancer} concepts={<Concepts />}>
      <Card>
        <CardTitle>選一個反應</CardTitle>
        <div className="space-y-2">
          {LEVELS.map((level) => (
            <div key={level} className="flex flex-wrap items-center gap-2">
              <span className="w-10 text-xs font-semibold text-ink-2">{LEVEL_LABEL[level]}</span>
              {REACTIONS.filter((r) => r.level === level).map((r) => (
                <Chip key={r.id} active={r.id === reaction.id} onClick={() => pick(r)}>
                  {r.nameZh}
                </Chip>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-4">
          {species.map((f, i) => (
            <Fragment key={`${reaction.id}-${i}`}>
              {i > 0 && (
                <span className="self-center pb-10 text-2xl text-ink-2">{i === nR ? '→' : '+'}</span>
              )}
              <SpeciesCard formula={f} coef={coeffs[i]} onChange={(d) => setCoef(i, d)} />
            </Fragment>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <AtomLegend elements={ledger.map((r) => r.element)} />
        </div>
        {reaction.note && <p className="mt-3 text-center text-sm text-ink-2">{reaction.note}</p>}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>原子帳本</CardTitle>
          <table className="w-full text-sm">
            <thead className="text-ink-2">
              <tr className="border-b border-line">
                <th className="py-1.5 text-left font-medium">元素</th>
                <th className="py-1.5 text-right font-medium">反應物</th>
                <th className="py-1.5 text-right font-medium">生成物</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {ledger.map((row) => {
                const ok = row.left === row.right
                return (
                  <tr key={row.element} className="border-b border-line last:border-0">
                    <td className="py-1.5">
                      {row.element} <span className="text-ink-2">{getElement(row.element).nameZh}</span>
                    </td>
                    <td className="py-1.5 text-right font-mono tabular-nums">{row.left}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">{row.right}</td>
                    <td className={`py-1.5 text-center font-bold ${ok ? 'text-good' : 'text-bad'}`}>
                      {ok ? '✓' : '✗'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>

        <Card className="space-y-3">
          <CardTitle>質量檢查</CardTitle>
          <MassLine label="反應物總質量" formulas={reaction.reactants} coeffs={coeffs.slice(0, nR)} total={masses.left} />
          <MassLine label="生成物總質量" formulas={reaction.products} coeffs={coeffs.slice(nR)} total={masses.right} />

          {balanced && simplest && (
            <Callout tone="good">
              平衡完成！兩邊每種原子數目相同，所以總質量也相同（{masses.left} = {masses.right}），這就是
              <strong>質量守恆定律</strong>。
            </Callout>
          )}
          {balanced && !simplest && (
            <Callout tone="warn">原子已經守恆了，但係數還可以同除一個數，請化成最簡單的整數比。</Callout>
          )}
          {!balanced && (
            <Callout tone="bad">
              兩邊原子數不相等，總質量也對不上，表示還沒平衡。
              {showHint && hint && (
                <span className="mt-1 block">
                  提示：先看 <strong>{hint.element}</strong>，反應物有 {hint.left} 個、生成物有 {hint.right} 個。
                </span>
              )}
            </Callout>
          )}
          <div className="flex flex-wrap gap-2">
            {!balanced && !showHint && <Button onClick={() => setShowHint(true)}>給我提示</Button>}
            <Button variant="ghost" onClick={() => setCoeffs(reaction.coefficients.map(() => 1))}>
              重來
            </Button>
            <Button variant="ghost" onClick={() => setCoeffs([...reaction.coefficients])}>
              看答案
            </Button>
          </div>
        </Card>
      </div>
    </ToolLayout>
  )
}

function SpeciesCard({ formula, coef, onChange }: { formula: string; coef: number; onChange: (d: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex max-w-56 min-h-8 flex-wrap items-center justify-center gap-1.5">
        {Array.from({ length: coef }, (_, k) => (
          <Molecule key={k} formula={formula} scale={formula.length > 5 ? 0.7 : 1} />
        ))}
      </div>
      <div className="text-xl font-semibold">
        <span className="text-accent">{coef === 1 ? '' : coef}</span>
        <Chem>{formula}</Chem>
      </div>
      <div className="flex items-center gap-1">
        <StepButton label={`減少 ${formula} 係數`} onClick={() => onChange(-1)} disabled={coef <= 1}>
          −
        </StepButton>
        <span className="w-6 text-center font-mono tabular-nums">{coef}</span>
        <StepButton label={`增加 ${formula} 係數`} onClick={() => onChange(1)} disabled={coef >= MAX_COEF}>
          +
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: string
  onClick: () => void
  disabled: boolean
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="size-8 rounded-lg border border-line bg-surface-2 text-lg leading-none hover:border-accent disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function MassLine({ label, formulas, coeffs, total }: { label: string; formulas: string[]; coeffs: number[]; total: number }) {
  return (
    <div className="text-sm">
      <div className="text-ink-2">{label}</div>
      <div className="font-mono tabular-nums">
        {formulas.map((f, i) => (
          <Fragment key={f}>
            {i > 0 && ' + '}
            {coeffs[i]}×{molarMass(f)}
          </Fragment>
        ))}{' '}
        = <strong>{total}</strong>
      </div>
    </div>
  )
}

function Concepts() {
  return (
    <>
      <p>
        化學反應只是原子<strong>重新排列組合</strong>，原子不會新增也不會消失。所以反應式兩邊每一種原子的數目都要相等，這叫做「平衡」。
      </p>
      <p>
        平衡時只能改<strong>係數</strong>（分子前面的數字），不能改化學式右下角的數字——改了就變成另一種物質了。例如把{' '}
        <Chem>H2O</Chem> 改成 <Chem>H2O2</Chem>，水就變成雙氧水。
      </p>
      <p>小技巧：先平衡只出現在一種物質裡的元素，最後再處理單質（如 <Chem>O2</Chem>、<Chem>H2</Chem>）。</p>
      <p>原子數守恆，總質量就守恆，這就是拉瓦節提出的「質量守恆定律」。</p>
    </>
  )
}
