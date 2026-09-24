import { createContext, useContext } from 'react'

export interface HighlightValue {
  key: string | null
  set: (key: string | null) => void
}

export const HighlightContext = createContext<HighlightValue>({ key: null, set: () => {} })

export function useHighlight() {
  return useContext(HighlightContext)
}
