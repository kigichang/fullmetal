import { useSearchParams } from 'react-router-dom'

/**
 * 以網址的 ?tab= 保存目前分頁，讓迷思回饋可以深連結到特定分頁與狀態。
 * 切換分頁時清掉其他參數（它們只屬於原本的分頁）。
 */
export function useTabParam<T extends string>(allowed: readonly T[], fallback: T) {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab') as T | null
  const tab = raw && allowed.includes(raw) ? raw : fallback
  const setTab = (next: T) => setParams({ tab: next }, { replace: true })
  return [tab, setTab, params] as const
}
