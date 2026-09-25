import { useEffect, useState } from 'react'
import {
  applyPerturbation,
  EQ_SYSTEMS,
  initialState,
  kAt,
  PERTURBATION_LABEL,
  relaxPath,
  shiftDirection,
  solveEquilibrium,
  type EqState,
  type EqSystem,
  type Perturbation,
  type Shift,
} from '../../chem/equilibrium'
import { Chem, ChemText } from '../../components/Chem'
import { TimeChart, type TimeMarker } from '../../components/TimeChart'
import { Hl } from '../../components/triplet/Highlight'
import { ParticleBox, PARTICLE_CAPACITY, type ParticleKind } from '../../components/triplet/ParticleBox'
import { TripletLayout } from '../../components/triplet/TripletLayout'
import { Button, Callout, Card, CardTitle, Chip, Segmented } from '../../components/ui'
import type { Level } from '../../learning/concepts'
import { MISCONCEPTIONS } from '../../learning/misconceptions'
import { useLearning } from '../../learning/useLearning'
import { chemUnicode, sci } from '../../lib/format'

const SERIES_COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)']
const TICK_MS = 45
const MAX_POINTS = 400

interface Point {
  /** 每個物種的濃度（M），含固定濃度的 H⁺ */
  c: number[]
  t: number
}

interface History {
  points: Point[]
  markers: TimeMarker[]
}

interface Outcome {
  action: Perturbation
  direction: Shift
  predicted: Shift | null
  before: EqState
  after: EqState
}

const concOf = (sys: EqSystem, s: EqState) => sys.species.map((sp, i) => (sp.fixed ? 10 ** -s.pH : s.n[i] / s.v))

const actionLabel = (a: Perturbation) =>
  a.kind === 'add' || a.kind === 'remove' ? `${PERTURBATION_LABEL[a.kind]} ${chemUnicode(a.formula)}` : PERTURBATION_LABEL[a.kind]

const DIRECTION_LABEL: Record<Shift, string> = {
  right: '向右移動（往生成物方向）',
  left: '向左移動（往反應物方向）',
  none: '不移動',
}

function freshHistory(sys: EqSystem, eq: EqState): History {
  const c = concOf(sys, eq)
  return { points: Array.from({ length: 8 }, () => ({ c, t: eq.t })), markers: [] }
}

/** 勒沙特列原理：改變條件 → 預測 → 觀察濃度隨時間回到新平衡 */
export function LeChatelier({ params }: { params: URLSearchParams }) {
  const initialSys = EQ_SYSTEMS.find((s) => s.id === params.get('sys')) ?? EQ_SYSTEMS[0]
  const [sys, setSys] = useState<EqSystem>(initialSys)
  const [level, setLevel] = useState<Level>(params.get('level') === 'senior' ? 'senior' : 'junior')
  const [eq, setEq] = useState<EqState>(() => solveEquilibrium(initialSys, initialState(initialSys)))
  const [history, setHistory] = useState<History>(() => freshHistory(initialSys, solveEquilibrium(initialSys, initialState(initialSys))))
  const [visible, setVisible] = useState(history.points.length)
  const [catalyst, setCatalyst] = useState(false)
  const [predictMode, setPredictMode] = useState(true)
  const [pending, setPending] = useState<Perturbation | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const { store } = useLearning()

  const animating = visible < history.points.length
  useEffect(() => {
    if (!animating) return
    const t = setTimeout(() => setVisible((v) => v + 1), TICK_MS)
    return () => clearTimeout(t)
  }, [animating, visible])

  const reset = (next: EqSystem) => {
    const e = solveEquilibrium(next, initialState(next))
    const h = freshHistory(next, e)
    setSys(next)
    setEq(e)
    setHistory(h)
    setVisible(h.points.length)
    setCatalyst(false)
    setPending(null)
    setOutcome(null)
  }

  const apply = (action: Perturbation, predicted: Shift | null) => {
    const perturbed = applyPerturbation(sys, eq, action)
    const direction = shiftDirection(sys, perturbed)
    const next = solveEquilibrium(sys, perturbed)
    const fast = catalyst || action.kind === 'catalyst'
    const path = relaxPath(perturbed, next, 30, fast)
    const newPoints: Point[] = [
      { c: concOf(sys, perturbed), t: perturbed.t },
      ...path.map((n) => ({ c: concOf(sys, { ...perturbed, n }), t: perturbed.t })),
    ]

    if (predicted) {
      const correct = predicted === direction
      const misconceptionId = !correct && action.kind === 'catalyst' ? 'catalyst-shifts' : undefined
      store.record(level === 'senior' ? 'eq.q-vs-k' : 'eq.le-chatelier', correct, { misconceptionId, bkt: { guess: 1 / 3 } })
    }

    let points = [...history.points, ...newPoints]
    let markers = [...history.markers, { x: history.points.length, label: actionLabel(action) }]
    if (points.length > MAX_POINTS) {
      const drop = points.length - MAX_POINTS
      points = points.slice(drop)
      markers = markers.map((m) => ({ ...m, x: m.x - drop })).filter((m) => m.x >= 0)
    }
    setHistory({ points, markers })
    setVisible(points.length - newPoints.length)
    if (action.kind === 'catalyst') setCatalyst(true)
    setEq(next)
    setOutcome({ action, direction, predicted, before: eq, after: next })
    setPending(null)
  }

  const onAction = (a: Perturbation) => {
    if (animating) return
    if (predictMode) setPending(a)
    else apply(a, null)
  }

  const shown = history.points.slice(0, visible)
  const now = shown.at(-1)!
  const movable = sys.species.map((sp, i) => ({ sp, i })).filter((x) => !x.sp.fixed)

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>選擇平衡系統</CardTitle>
          <Segmented<Level>
            value={level}
            onChange={setLevel}
            options={[
              { value: 'junior', label: '國中' },
              { value: 'senior', label: '高中（Q 與 K）' },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {EQ_SYSTEMS.map((s) => (
            <Chip key={s.id} active={s.id === sys.id} onClick={() => reset(s)}>
              {s.nameZh}
              {s.level === 'senior' && <span className="ml-1 text-xs opacity-75">高中</span>}
            </Chip>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg bg-surface-2 px-3 py-2 text-center text-lg">
          <EquationView sys={sys} />
          <div className="mt-1 text-xs text-ink-2">
            {sys.dH === 0 ? '（本模擬忽略溫度效應）' : `正反應${sys.dH > 0 ? '吸熱' : '放熱'}（ΔH = ${sys.dH > 0 ? '+' : '−'}${Math.abs(sys.dH)} kJ）`}
          </div>
        </div>
        <p className="text-sm text-ink-2">{sys.note}</p>
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>改變條件</CardTitle>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={predictMode} onChange={(e) => setPredictMode(e.target.checked)} className="accent-[var(--accent)]" />
            先預測再觀察
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {sys.actions.map((a) => (
            <Button key={actionLabel(a)} onClick={() => onAction(a)} disabled={animating || (a.kind === 'catalyst' && catalyst)}>
              {actionLabel(a)}
            </Button>
          ))}
          <Button variant="ghost" onClick={() => reset(sys)}>
            重設
          </Button>
        </div>

        {pending && (
          <div className="space-y-2 rounded-lg border border-accent p-3">
            <p className="text-sm font-semibold">「{actionLabel(pending)}」之後，平衡會往哪邊移動？</p>
            <div className="flex flex-wrap gap-2">
              {(['right', 'left', 'none'] as Shift[]).map((d) => (
                <Chip key={d} active={false} onClick={() => apply(pending, d)}>
                  {DIRECTION_LABEL[d]}
                </Chip>
              ))}
              <Button variant="ghost" onClick={() => apply(pending, null)}>
                不預測，直接看
              </Button>
            </div>
          </div>
        )}

        {outcome && !pending && <OutcomeView sys={sys} outcome={outcome} level={level} />}
      </Card>

      <TripletLayout
        macro={<MacroView sys={sys} point={now} eq={eq} catalyst={catalyst} reference={history.points[0]} />}
        micro={<MicroView sys={sys} point={now} reference={history.points[0]} />}
        symbolic={<SymbolicView sys={sys} point={now} level={level} />}
      />

      <Card>
        <TimeChart
          series={movable.map(({ sp, i }, k) => ({
            key: sp.formula,
            label: sp.formula,
            color: SERIES_COLORS[k],
            values: shown.map((p) => p.c[i]),
          }))}
          markers={history.markers.filter((m) => m.x < visible)}
          yLabel="濃度（M）"
          xLabel="時間"
          format={(v) => (v === 0 ? '0' : v < 0.01 ? sci(v, 1) : v.toFixed(3))}
          caption="各物質濃度隨時間的變化。虛線是改變條件的時刻：濃度先瞬間改變，再逐漸趨向新的平衡（時間軸為示意）。"
        />
      </Card>
    </div>
  )
}

function EquationView({ sys }: { sys: EqSystem }) {
  const side = (list: EqSystem['species']) =>
    list.map((sp, i) => (
      <span key={sp.formula}>
        {i > 0 && ' + '}
        <Hl k={sp.formula}>
          <Chem>{`${Math.abs(sp.nu) === 1 ? '' : Math.abs(sp.nu)}${sp.formula}`}</Chem>
        </Hl>
        {sp.color && <span className="ml-0.5 text-xs text-ink-2">（{sp.colorName}）</span>}
      </span>
    ))
  return (
    <>
      {side(sys.species.filter((s) => s.nu < 0))} <Chem>{'<=>'}</Chem> {side(sys.species.filter((s) => s.nu > 0))}
    </>
  )
}

function OutcomeView({ sys, outcome, level }: { sys: EqSystem; outcome: Outcome; level: Level }) {
  const { action, direction, predicted } = outcome
  const reason = explain(sys, action)
  const correct = predicted === direction
  const mis = predicted && !correct && action.kind === 'catalyst' ? 'catalyst-shifts' : undefined
  return (
    <div className="space-y-2">
      {predicted && (
        <Callout tone={correct ? 'good' : 'bad'}>
          {correct ? '預測正確！' : `你預測「${DIRECTION_LABEL[predicted]}」，實際上是「${DIRECTION_LABEL[direction]}」。`}
          {mis && (
            <span className="mt-1 block">
              <ChemText>{MISCONCEPTIONS[mis].explanation}</ChemText>
            </span>
          )}
        </Callout>
      )}
      <p className="text-sm">
        <strong>{actionLabel(action)}</strong>：{reason} → 平衡<strong>{DIRECTION_LABEL[direction]}</strong>。
      </p>
      {level === 'senior' && action.kind !== 'catalyst' && (
        <p className="text-xs text-ink-2">
          {action.kind === 'heat' || action.kind === 'cool'
            ? `溫度改變使 K 由 ${sci(kAt(sys, outcome.before.t))} 變為 ${sci(kAt(sys, outcome.after.t))}，原來的組成 Q 不再等於 K。`
            : `K 不變（${sci(kAt(sys, outcome.after.t))}），但改變後瞬間 Q ${direction === 'right' ? '<' : direction === 'left' ? '>' : '='} K。`}
        </p>
      )}
    </div>
  )
}

/** 以國中語言說明平衡為什麼往這邊移動 */
function explain(sys: EqSystem, a: Perturbation): string {
  const gasMoles = (sign: number) => sys.species.filter((s) => Math.sign(s.nu) === sign && !s.fixed).reduce((acc, s) => acc + Math.abs(s.nu), 0)
  switch (a.kind) {
    case 'heat':
      return `升高溫度，平衡往吸熱方向移動（本反應正反應${sys.dH > 0 ? '吸熱' : '放熱'}）`
    case 'cool':
      return `降低溫度，平衡往放熱方向移動（本反應正反應${sys.dH > 0 ? '吸熱' : '放熱'}）`
    case 'compress':
      return `壓縮體積使壓力變大，平衡往氣體分子數較少的一邊移動（左邊 ${gasMoles(-1)}、右邊 ${gasMoles(1)}）`
    case 'expand':
      return `擴大體積使壓力變小，平衡往氣體分子數較多的一邊移動（左邊 ${gasMoles(-1)}、右邊 ${gasMoles(1)}）`
    case 'dilute':
      return `加水稀釋，平衡往溶質粒子數較多的一邊移動（左邊 ${gasMoles(-1)}、右邊 ${gasMoles(1)}）`
    case 'add':
      return `加入 ${chemUnicode(a.formula)}，平衡往消耗 ${chemUnicode(a.formula)} 的方向移動`
    case 'remove':
      return `移走 ${chemUnicode(a.formula)}，平衡往生成 ${chemUnicode(a.formula)} 的方向移動`
    case 'acid':
      return '加酸使 H⁺ 增加，平衡往消耗 H⁺ 的方向移動'
    case 'base':
      return '加鹼的 OH⁻ 中和掉 H⁺，H⁺ 減少，平衡往生成 H⁺ 的方向移動'
    case 'catalyst':
      return '催化劑同時加快正、逆反應，只讓系統更快達到平衡'
  }
}

function MacroView({
  sys,
  point,
  eq,
  catalyst,
  reference,
}: {
  sys: EqSystem
  point: Point
  eq: EqState
  catalyst: boolean
  reference: Point
}) {
  const colored = sys.species.map((sp, i) => ({ sp, i })).filter((x) => x.sp.color)
  const height = sys.gas ? Math.max(30, Math.min(100, 60 * (eq.v / sys.v0))) : 70
  return (
    <div className="space-y-2">
      <svg viewBox="0 0 140 130" className="mx-auto h-40" role="img" aria-label="容器中的顏色">
        <rect x={25} y={120 - height - 6} width={90} height={height + 6} rx={6} fill="var(--surface-2)" stroke="var(--glass)" strokeWidth={3} />
        {colored.map(({ sp, i }) => {
          const ref = Math.max(reference.c[i], 1e-9)
          const opacity = Math.min(0.9, (point.c[i] / ref) * 0.45)
          return <rect key={sp.formula} x={28} y={120 - height - 3} width={84} height={height} rx={4} fill={sp.color} opacity={opacity} />
        })}
        {sys.gas && <rect x={20} y={120 - height - 12} width={100} height={6} rx={2} fill="var(--ink-2)" />}
      </svg>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <dt className="text-ink-2">溫度</dt>
        <dd>
          {eq.t} K（{eq.t - 273} °C）
        </dd>
        <dt className="text-ink-2">{sys.gas ? '體積' : '溶液體積'}</dt>
        <dd>{eq.v} L</dd>
        {sys.species.some((s) => s.fixed) && (
          <>
            <dt className="text-ink-2">pH</dt>
            <dd>{eq.pH}</dd>
          </>
        )}
        <dt className="text-ink-2">催化劑</dt>
        <dd>{catalyst ? '已加入' : '無'}</dd>
      </dl>
      <div className="flex flex-wrap gap-x-3 text-xs">
        {colored.map(({ sp }) => (
          <Hl key={sp.formula} k={sp.formula}>
            <span className="mr-1 inline-block size-2.5 rounded-sm align-middle" style={{ background: sp.color }} />
            <Chem>{sp.formula}</Chem> {sp.colorName}
          </Hl>
        ))}
      </div>
    </div>
  )
}

function MicroView({ sys, point, reference }: { sys: EqSystem; point: Point; reference: Point }) {
  const movable = sys.species.map((sp, i) => ({ sp, i })).filter((x) => !x.sp.fixed)
  // 以濃度換算「一小塊容器中的粒子數」：初始平衡時總共約 36 顆
  const refTotal = movable.reduce((s, { i }) => s + reference.c[i], 0)
  const scale = 36 / Math.max(refTotal, 1e-12)
  const counts = movable.map(({ i }) => Math.round(point.c[i] * scale))
  const total = counts.reduce((a, b) => a + b, 0)
  const kinds: ParticleKind[] = movable.map(({ sp }, k) => ({
    key: sp.formula,
    label: chemUnicode(sp.formula).replace(/[⁺⁻²³]/g, ''),
    fill: SERIES_COLORS[k],
    text: '#fff',
    r: 8,
  }))
  return (
    <div className="space-y-2">
      <ParticleBox kinds={kinds} counts={counts} label={movable.map(({ sp }, k) => `${chemUnicode(sp.formula)} ${counts[k]} 個`).join('、')} />
      {total > PARTICLE_CAPACITY && <p className="text-xs text-warn">粒子太多，只畫出一部分。</p>}
      <div className="flex flex-wrap gap-x-3 text-xs">
        {movable.map(({ sp }, k) => (
          <Hl key={sp.formula} k={sp.formula}>
            <span className="mr-1 inline-block size-2.5 rounded-full align-middle" style={{ background: SERIES_COLORS[k] }} />
            <Chem>{sp.formula}</Chem> × {counts[k]}
          </Hl>
        ))}
      </div>
      <p className="text-xs text-ink-2">畫面是容器中固定的一小塊：壓縮或稀釋時，粒子會變密或變疏。</p>
    </div>
  )
}

function SymbolicView({ sys, point, level }: { sys: EqSystem; point: Point; level: Level }) {
  const term = (sp: EqSystem['species'][number]) => `[${chemUnicode(sp.formula)}]${Math.abs(sp.nu) > 1 ? superscript(Math.abs(sp.nu)) : ''}`
  const num = sys.species.filter((s) => s.nu > 0).map(term).join('')
  const den = sys.species.filter((s) => s.nu < 0).map(term).join('')
  const q = Math.exp(sys.species.reduce((acc, sp, i) => acc + sp.nu * Math.log(point.c[i]), 0))
  const k = kAt(sys, point.t)
  const ratio = Math.log10(q / k)
  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="text-xs text-ink-2">平衡常數表示式</div>
        <div className="mt-1 flex items-center gap-2 font-mono">
          <span>K =</span>
          <span className="inline-flex flex-col items-center leading-tight">
            <span className="border-b border-ink px-1">{num}</span>
            <span className="px-1">{den}</span>
          </span>
        </div>
      </div>
      <ul className="space-y-1 text-xs">
        {sys.species
          .map((sp, i) => ({ sp, i }))
          .map(({ sp, i }) => (
            <li key={sp.formula} className="flex justify-between gap-2">
              <Hl k={sp.formula}>
                [<Chem>{sp.formula}</Chem>]
              </Hl>
              <span className="font-mono tabular-nums">
                {sci(point.c[i])} M{sp.fixed ? '（由 pH 決定）' : ''}
              </span>
            </li>
          ))}
      </ul>
      {level === 'senior' ? (
        <div className="space-y-1 rounded-lg bg-surface-2 p-2 font-mono text-xs">
          <div>K（{point.t} K）= {sci(k)}</div>
          <div>Q（目前）= {sci(q)}</div>
          <div className="font-sans font-semibold">
            {Math.abs(ratio) < 0.01 ? 'Q = K：已達平衡' : ratio < 0 ? 'Q < K：淨反應向右進行' : 'Q > K：淨反應向左進行'}
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-2">溫度不變時，K 是定值。改變濃度或壓力後，各物質濃度會重新調整，直到再次符合 K。</p>
      )}
    </div>
  )
}

function superscript(n: number): string {
  return String(n)
    .split('')
    .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])
    .join('')
}
