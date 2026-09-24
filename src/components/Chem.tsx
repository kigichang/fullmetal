import { Fragment, type ReactNode } from 'react'

/**
 * 渲染化學式／反應式字串。
 * 規則：以空白分隔；`+`、`->`、`<=>` 為符號；物種開頭的數字是係數；
 * 字母或右括號後的數字為下標；`^` 之後的電荷為上標（例如 SO4^2-）。
 */
export function Chem({ children, className }: { children: string; className?: string }) {
  const tokens = children.split(' ').filter(Boolean)
  return (
    <span className={className} style={{ whiteSpace: 'nowrap' }}>
      {tokens.map((t, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          {renderToken(t)}
        </Fragment>
      ))}
    </span>
  )
}

function renderToken(token: string): ReactNode {
  if (token === '->') return '→'
  if (token === '<=>') return '⇌'
  if (token === '+') return '+'
  const out: ReactNode[] = []
  let i = 0
  const coef = /^(\d+)(?=[A-Z(])/.exec(token)
  if (coef) {
    out.push(<span key="c">{coef[1]}</span>)
    i = coef[1].length
  }
  let text = ''
  const flush = () => {
    if (text) out.push(text)
    text = ''
  }
  while (i < token.length) {
    const ch = token[i]
    const prev = token[i - 1]
    if (ch === '^') {
      flush()
      let charge = ''
      i++
      while (i < token.length && /[0-9+-]/.test(token[i])) charge += token[i++]
      out.push(<sup key={`p${i}`}>{charge.replace('-', '−')}</sup>)
      continue
    }
    if (/\d/.test(ch) && prev && /[A-Za-z)]/.test(prev)) {
      flush()
      let digits = ''
      while (i < token.length && /\d/.test(token[i])) digits += token[i++]
      out.push(<sub key={`b${i}`}>{digits}</sub>)
      continue
    }
    text += ch
    i++
  }
  flush()
  return out
}

/** 一般文字中夾帶化學式：{{H2O}} 這種片段會用 Chem 渲染 */
export function ChemText({ children }: { children: string }) {
  return (
    <>
      {children.split(/\{\{(.+?)\}\}/).map((part, i) =>
        i % 2 ? <Chem key={i}>{part}</Chem> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  )
}
