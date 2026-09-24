import type { ReactNode } from 'react'

export interface ToolMeta {
  path: string
  title: string
  unit: string
  goal: string
  preview: string
}

export function ToolLayout({
  meta,
  concepts,
  children,
}: {
  meta: ToolMeta
  concepts?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-medium text-accent">{meta.unit}</p>
        <h1 className="text-2xl font-bold">{meta.title}</h1>
        <p className="text-sm text-ink-2">{meta.goal}</p>
      </header>
      {concepts && (
        <details className="group rounded-xl border border-line bg-surface">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold select-none">
            <span className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>
            5 分鐘觀念補充
          </summary>
          <div className="space-y-2 border-t border-line px-4 py-3 text-sm leading-relaxed text-ink-2">{concepts}</div>
        </details>
      )}
      {children}
    </div>
  )
}
