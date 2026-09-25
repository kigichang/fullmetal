# 化學互動工具箱（國中版）

輔助台灣國中理化化學單元的互動工具，不取代課本。

線上版：https://kigichang.github.io/fullmetal/（推送到 `main` 後由 GitHub Actions 自動部署）

| 工具 | 路徑 | 對應單元 |
| --- | --- | --- |
| 元素週期表 | `#/periodic-table` | 八年級・物質的基本結構 |
| 反應式平衡與質量守恆 | `#/balance` | 八年級・化學反應 |
| 莫耳與限量試劑計算台 | `#/stoichiometry` | 八年級・原子量、分子量與莫耳 |
| 酸鹼指示劑與中和 | `#/acid-base` | 八、九年級・電解質與酸鹼鹽 |
| 沉澱反應矩陣 | `#/precipitation` | 九年級・水溶液中的離子反應 |
| 氧化還原與電池 | `#/redox` | 九年級・氧化與還原（高中：氧化數、電化學） |
| 化學平衡 | `#/equilibrium` | 九年級・可逆反應與平衡（高中：平衡常數） |
| 我的學習紀錄 | `#/progress` | 各觀念精熟度與迷思 |

## 學習設計

- **三表徵連動**：莫耳與酸鹼工具以「巨觀－微觀－符號」三個面板同步呈現，滑過任一物質會在三個面板一起標示。
- **兩階層診斷題**：先選答案、再選理由，錯誤選項對應常見迷思並給針對性說明與「去模擬器看看」的連結。
- **精熟度追蹤**：以貝氏知識追蹤（BKT）估計每個觀念的熟練度（預測答對率 95% 為精熟），紀錄只存在瀏覽器 localStorage，可匯出／匯入。
- 題目與迷思說明由本站整理，建議老師審閱後使用。

## 開發

```bash
npm install
npm run dev     # 開發伺服器
npm test        # 化學計算引擎單元測試（src/chem）
npm run build   # 產出靜態網站到 dist/，可直接部署到 GitHub Pages 等
```

## 結構

- `src/chem/`：純計算邏輯（化學式解析、平衡、限量試劑、pH、沉澱表），不依賴 React，皆有測試
- `src/components/`：`Chem`（化學式上下標）、`Molecule`（分子球棍圖）、`ToolLayout`、共用 UI
- `src/learning/`：觀念、迷思、BKT 精熟度、學習紀錄 store、兩階層題庫
- `src/components/triplet/`：三表徵版面、同步高亮、粒子盒
- `src/tools/`：四個工具頁面；`registry.ts` 管理標題、路徑與對應單元
