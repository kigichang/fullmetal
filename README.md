# 化學互動工具箱（國中版）

輔助台灣國中理化化學單元的互動工具，不取代課本。

線上版：https://kigichang.github.io/fullmetal/（推送到 `main` 後由 GitHub Actions 自動部署）

| 工具 | 路徑 | 對應單元 |
| --- | --- | --- |
| 反應式平衡與質量守恆 | `#/balance` | 八年級・化學反應 |
| 莫耳與限量試劑計算台 | `#/stoichiometry` | 八年級・原子量、分子量與莫耳 |
| 酸鹼指示劑與中和 | `#/acid-base` | 八、九年級・電解質與酸鹼鹽 |
| 沉澱反應矩陣 | `#/precipitation` | 九年級・水溶液中的離子反應 |

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
- `src/tools/`：四個工具頁面；`registry.ts` 管理標題、路徑與對應單元
