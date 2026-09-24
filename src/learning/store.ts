import { DEFAULT_BKT, updateMastery, type BktParams } from './mastery'

export interface ConceptRecord {
  p: number
  attempts: number
  correct: number
  updatedAt: number
}

export interface MistakeRecord {
  misconceptionId: string
  conceptId: string
  at: number
}

export interface LearningState {
  version: 1
  concepts: Record<string, ConceptRecord>
  mistakes: MistakeRecord[]
}

const KEY = 'fullmetal.learning.v1'
const MAX_MISTAKES = 200

export const emptyState = (): LearningState => ({ version: 1, concepts: {}, mistakes: [] })

/** 驗證並修正外部資料（localStorage 或匯入檔），不合格就回傳 null */
export function parseState(raw: unknown): LearningState | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Partial<LearningState>
  if (obj.version !== 1 || typeof obj.concepts !== 'object' || !Array.isArray(obj.mistakes)) return null
  const concepts: Record<string, ConceptRecord> = {}
  for (const [id, r] of Object.entries(obj.concepts ?? {})) {
    if (r && typeof r.p === 'number' && r.p >= 0 && r.p <= 1) {
      concepts[id] = {
        p: r.p,
        attempts: Number(r.attempts) || 0,
        correct: Number(r.correct) || 0,
        updatedAt: Number(r.updatedAt) || 0,
      }
    }
  }
  const mistakes = obj.mistakes
    .filter((m) => m && typeof m.misconceptionId === 'string' && typeof m.conceptId === 'string')
    .map((m) => ({ misconceptionId: m.misconceptionId, conceptId: m.conceptId, at: Number(m.at) || 0 }))
    .slice(-MAX_MISTAKES)
  return { version: 1, concepts, mistakes }
}

type KV = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function safeStorage(): KV | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export interface RecordOptions {
  misconceptionId?: string
  bkt?: Partial<BktParams>
}

export function createStore(storage: KV | null = safeStorage()) {
  let state = load()
  const listeners = new Set<() => void>()

  function load(): LearningState {
    try {
      const text = storage?.getItem(KEY)
      return (text && parseState(JSON.parse(text))) || emptyState()
    } catch {
      return emptyState()
    }
  }

  function commit(next: LearningState) {
    state = next
    try {
      storage?.setItem(KEY, JSON.stringify(next))
    } catch {
      // 無痕模式或儲存空間已滿：只保留在記憶體
    }
    listeners.forEach((l) => l())
  }

  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    record(conceptId: string, correct: boolean, opts: RecordOptions = {}) {
      const params = { ...DEFAULT_BKT, ...opts.bkt }
      const prev = state.concepts[conceptId]
      const now = Date.now()
      const rec: ConceptRecord = {
        p: updateMastery(prev?.p ?? params.init, correct, params),
        attempts: (prev?.attempts ?? 0) + 1,
        correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
        updatedAt: now,
      }
      const mistakes = opts.misconceptionId
        ? [...state.mistakes, { misconceptionId: opts.misconceptionId, conceptId, at: now }].slice(-MAX_MISTAKES)
        : state.mistakes
      commit({ ...state, concepts: { ...state.concepts, [conceptId]: rec }, mistakes })
    },
    reset() {
      try {
        storage?.removeItem(KEY)
      } catch {
        // 忽略
      }
      state = emptyState()
      listeners.forEach((l) => l())
    },
    exportJson: () => JSON.stringify(state, null, 2),
    /** 匯入成功回傳 true */
    importJson(text: string): boolean {
      try {
        const parsed = parseState(JSON.parse(text))
        if (!parsed) return false
        commit(parsed)
        return true
      } catch {
        return false
      }
    },
  }
}

export type LearningStore = ReturnType<typeof createStore>

export const learningStore = createStore()
