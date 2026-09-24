import { useState, type ReactNode } from 'react'
import { HighlightContext, useHighlight } from './highlightContext'

/**
 * 三表徵同步高亮：滑過（或點選）任一表徵中的物種，
 * 其他表徵中同一個物種一起亮起來，幫助學生建立對應。
 */
export function HighlightProvider({ children }: { children: ReactNode }) {
  const [key, set] = useState<string | null>(null)
  return <HighlightContext.Provider value={{ key, set }}>{children}</HighlightContext.Provider>
}

/** 可高亮的物種標記：包住任何表徵中的物種（化學式、表格欄位、圖例…） */
export function Hl({ k, children, className = '' }: { k: string; children: ReactNode; className?: string }) {
  const { key, set } = useHighlight()
  const active = key === k
  return (
    <span
      tabIndex={0}
      onMouseEnter={() => set(k)}
      onMouseLeave={() => set(null)}
      onFocus={() => set(k)}
      onBlur={() => set(null)}
      className={`cursor-default rounded px-0.5 transition-colors ${active ? 'bg-accent-soft text-accent ring-1 ring-accent' : ''} ${className}`}
    >
      {children}
    </span>
  )
}
