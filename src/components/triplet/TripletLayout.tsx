import type { ReactNode } from 'react'
import { HighlightProvider } from './Highlight'

const PANES = [
  { key: 'macro', title: '巨觀', sub: '看得到、量得到的' },
  { key: 'micro', title: '微觀', sub: '粒子的世界' },
  { key: 'symbolic', title: '符號', sub: '化學式與計算' },
] as const

/**
 * 化學三角（巨觀－微觀－符號）三個面板並排，並提供同步高亮。
 * 手機上依序直向堆疊。
 */
export function TripletLayout({
  macro,
  micro,
  symbolic,
  hint = '滑過或點選任一物質，三個面板會一起標示它。',
}: {
  macro: ReactNode
  micro: ReactNode
  symbolic: ReactNode
  hint?: string
}) {
  const content = { macro, micro, symbolic }
  return (
    <HighlightProvider>
      <div className="grid gap-3 lg:grid-cols-3">
        {PANES.map((p) => (
          <section key={p.key} className="flex flex-col rounded-xl border border-line bg-surface">
            <header className="flex items-baseline gap-2 border-b border-line px-4 py-2">
              <span className="text-sm font-bold">{p.title}</span>
              <span className="text-xs text-ink-2">{p.sub}</span>
            </header>
            <div className="flex-1 p-4">{content[p.key]}</div>
          </section>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-2">{hint}</p>
    </HighlightProvider>
  )
}
