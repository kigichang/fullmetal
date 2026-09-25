import { Fragment, useEffect, useState } from 'react'
import type { LedgerRow } from '../../chem/balance'
import { getElement } from '../../chem/elements'
import { Hl } from '../../components/triplet/Highlight'
import { useHighlight } from '../../components/triplet/highlightContext'
import { Button, CardTitle } from '../../components/ui'

const STEP_MS = 1500

/**
 * 原子計數：每種元素左右兩側各畫一排原子，一對一配對；
 * 多出來的標紅、缺少的畫成虛線圈。「數一數」會依序標示每一種元素。
 */
export function AtomTally({ ledger }: { ledger: LedgerRow[] }) {
  const { key, set } = useHighlight()
  const [counting, setCounting] = useState<number | null>(null)

  useEffect(() => {
    if (counting === null) return
    set(ledger[counting].element)
    const t = setTimeout(() => {
      if (counting + 1 >= ledger.length) {
        set(null)
        setCounting(null)
      } else setCounting(counting + 1)
    }, STEP_MS)
    return () => clearTimeout(t)
  }, [counting, ledger, set])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>原子計數（一顆對一顆）</CardTitle>
        <Button onClick={() => setCounting(counting === null ? 0 : null)}>{counting === null ? '數一數' : '停止'}</Button>
      </div>
      <div className="grid grid-cols-[3rem_1fr_1fr] gap-x-3 gap-y-2 text-xs text-ink-2">
        <span />
        <span>反應物</span>
        <span>生成物</span>
        {ledger.map((row) => {
          const el = getElement(row.element)
          const slots = Math.max(row.left, row.right)
          const fade = key !== null && key !== row.element ? 'opacity-30' : ''
          return (
            <Fragment key={row.element}>
              <Hl k={row.element} className={`self-center text-sm font-semibold text-ink transition-opacity ${fade}`}>
                {row.element}
              </Hl>
              <Dots count={row.left} slots={slots} color={el.color} extraFrom={row.right} className={fade} />
              <Dots count={row.right} slots={slots} color={el.color} extraFrom={row.left} className={fade} />
            </Fragment>
          )
        })}
      </div>
      <p className="text-xs text-ink-2">
        紅框＝這一邊多出來的原子；虛線圈＝這一邊還少的原子。兩邊一顆對一顆完全配對時，這種元素就平衡了。
      </p>
    </div>
  )
}

/** count 個原子，其中超過對邊數量（extraFrom）的標為「多出」；不足 slots 的畫成虛線空位 */
function Dots({
  count,
  slots,
  color,
  extraFrom,
  className = '',
}: {
  count: number
  slots: number
  color: string
  extraFrom: number
  className?: string
}) {
  return (
    <div className={`flex flex-wrap gap-1 transition-opacity ${className}`} aria-label={`${count} 個`}>
      {Array.from({ length: slots }, (_, i) => {
        if (i >= count) return <span key={i} className="size-3.5 rounded-full border border-dashed border-ink-2" />
        const extra = i >= extraFrom
        return (
          <span
            key={i}
            className={`size-3.5 rounded-full border ${extra ? 'border-2 border-bad' : 'border-black/30'}`}
            style={{ background: color }}
          />
        )
      })}
      <span className="ml-1 font-mono text-ink">{count}</span>
    </div>
  )
}
