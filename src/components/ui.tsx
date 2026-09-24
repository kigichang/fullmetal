import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-line bg-surface p-4 sm:p-5 ${className}`}>{children}</section>
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-sm font-semibold tracking-wide text-ink-2">{children}</h2>
}

export function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        active
          ? 'border-accent bg-accent text-accent-ink'
          : 'border-line bg-surface text-ink hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            value === o.value ? 'bg-surface font-semibold text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'default',
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'default' | 'primary' | 'ghost'
  disabled?: boolean
}) {
  const styles = {
    default: 'border border-line bg-surface hover:bg-surface-2 text-ink',
    primary: 'bg-accent text-accent-ink hover:opacity-90',
    ghost: 'text-ink-2 hover:text-ink underline underline-offset-4',
  }[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  )
}

type Tone = 'good' | 'bad' | 'warn' | 'info'

export function Callout({ tone, children }: { tone: Tone; children: ReactNode }) {
  const styles: Record<Tone, string> = {
    good: 'bg-good-soft text-good border-good/30',
    bad: 'bg-bad-soft text-bad border-bad/30',
    warn: 'bg-warn-soft text-warn border-warn/30',
    info: 'bg-surface-2 text-ink border-line',
  }
  return <div className={`rounded-lg border px-3 py-2 text-sm ${styles[tone]}`}>{children}</div>
}
