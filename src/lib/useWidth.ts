import { useLayoutEffect, useState, type RefObject } from 'react'

/** 量測元素寬度（先同步量一次，再以 ResizeObserver 追蹤），供 SVG 圖表決定畫布大小 */
export function useWidth(ref: RefObject<HTMLElement | null>, min = 280, fallback = 600): number {
  const [width, setWidth] = useState(fallback)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(Math.max(min, el.clientWidth))
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(min, entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, min])
  return width
}
