import { useSyncExternalStore } from 'react'
import { learningStore } from './store'

/** 訂閱學習紀錄；回傳目前狀態與寫入方法 */
export function useLearning() {
  const state = useSyncExternalStore(learningStore.subscribe, learningStore.getState, learningStore.getState)
  return { state, store: learningStore }
}
