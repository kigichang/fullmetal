import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChemText } from '../components/Chem'
import { Button, Callout, Card, CardTitle } from '../components/ui'
import { CONCEPTS, LEVEL_LABEL, type Level } from '../learning/concepts'
import { isMastered, predictCorrect } from '../learning/mastery'
import { MISCONCEPTIONS } from '../learning/misconceptions'
import { useLearning } from '../learning/useLearning'

export default function Progress() {
  const { state, store } = useLearning()
  const [confirmReset, setConfirmReset] = useState(false)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // 依迷思彙整：次數與最近一次
  const mistakeSummary = Object.values(
    state.mistakes.reduce<Record<string, { id: string; count: number; last: number }>>((acc, m) => {
      const cur = acc[m.misconceptionId] ?? { id: m.misconceptionId, count: 0, last: 0 }
      acc[m.misconceptionId] = { ...cur, count: cur.count + 1, last: Math.max(cur.last, m.at) }
      return acc
    }, {}),
  )
    .filter((m) => MISCONCEPTIONS[m.id])
    .sort((a, b) => b.last - a.last)

  const download = () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `化學學習紀錄-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const upload = async (file: File) => {
    const ok = store.importJson(await file.text())
    setImportMsg(ok ? { ok, text: '匯入成功。' } : { ok, text: '檔案格式不正確，沒有匯入。' })
  }

  const hasData = Object.keys(state.concepts).length > 0

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">我的學習紀錄</h1>
        <p className="text-sm text-ink-2">
          根據你在各工具的作答推估每個觀念的熟練程度，預測答對率達 95% 就算精熟。紀錄只存在這台裝置的瀏覽器裡，不會上傳。
        </p>
      </header>

      {!hasData && (
        <Callout tone="info">
          還沒有紀錄。到
          <Link to="/stoichiometry?tab=quiz" className="mx-1 text-accent underline underline-offset-4">
            莫耳計算
          </Link>
          或
          <Link to="/acid-base?tab=quiz" className="mx-1 text-accent underline underline-offset-4">
            酸鹼
          </Link>
          的「診斷挑戰」做幾題，這裡就會出現你的觀念地圖。
        </Callout>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(['junior', 'senior'] as Level[]).map((level) => (
          <Card key={level}>
            <CardTitle>{LEVEL_LABEL[level]}觀念</CardTitle>
            <ul className="space-y-3">
              {CONCEPTS.filter((c) => c.level === level).map((c) => {
                const rec = state.concepts[c.id]
                const predicted = rec ? predictCorrect(rec.p) : 0
                const mastered = rec ? isMastered(rec.p) : false
                return (
                  <li key={c.id}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <Link to={c.link} className="font-medium hover:text-accent">
                        {c.nameZh}
                      </Link>
                      <span className="shrink-0 text-xs text-ink-2">
                        {rec ? (
                          <>
                            {mastered && <span className="mr-1.5 font-semibold text-good">精熟</span>}
                            答對 {rec.correct}/{rec.attempts}
                          </>
                        ) : (
                          '尚未練習'
                        )}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-2 rounded-full bg-surface-2"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(predicted * 100)}
                      aria-label={`${c.nameZh}預測答對率`}
                    >
                      <div
                        className={`h-2 rounded-full transition-all ${mastered ? 'bg-good' : 'bg-accent'}`}
                        style={{ width: `${predicted * 100}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>需要注意的迷思</CardTitle>
        {mistakeSummary.length === 0 ? (
          <p className="text-sm text-ink-2">目前沒有偵測到迷思。</p>
        ) : (
          <ul className="divide-y divide-line">
            {mistakeSummary.map((m) => {
              const mis = MISCONCEPTIONS[m.id]
              return (
                <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">{mis.nameZh}</span>
                    <span className="text-xs text-ink-2">出現 {m.count} 次</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-2">
                    <ChemText>{mis.explanation}</ChemText>
                  </p>
                  <Link to={mis.remedy.link} className="mt-1 inline-block text-sm font-medium text-accent underline underline-offset-4">
                    {mis.remedy.label} →
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card className="space-y-3">
        <CardTitle>備份與換裝置</CardTitle>
        <p className="text-sm text-ink-2">紀錄存在瀏覽器裡。換電腦或清除瀏覽資料前，可以先匯出成檔案，之後再匯入。</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={download} disabled={!hasData}>
            匯出紀錄
          </Button>
          <Button onClick={() => fileRef.current?.click()}>匯入紀錄</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void upload(f)
              e.target.value = ''
            }}
          />
          {confirmReset ? (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  store.reset()
                  setConfirmReset(false)
                }}
              >
                確定清除
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                取消
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmReset(true)} disabled={!hasData}>
              清除所有紀錄
            </Button>
          )}
        </div>
        {importMsg && <Callout tone={importMsg.ok ? 'good' : 'bad'}>{importMsg.text}</Callout>}
      </Card>

      <p className="text-xs text-ink-2">
        題目與迷思說明由本站整理，歡迎老師指正。
      </p>
    </div>
  )
}
