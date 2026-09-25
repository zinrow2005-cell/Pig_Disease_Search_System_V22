# GitHub Pages 正式發布版

這個資料夾可以直接作為 GitHub Repository 根目錄。

## 建議部署方式

1. 在 GitHub 建立一個新的 repository，例如：
   `pig-disease-search-system`

2. 使用 GitHub Desktop：
   - Add local repository
   - 選擇本資料夾
   - Publish repository

3. Repository → Settings → Pages
   - Source：Deploy from a branch
   - Branch：main
   - Folder：/ (root)
   - Save

4. 等待 GitHub Pages 建置完成後，網址通常為：
   `https://<你的帳號>.github.io/<repository名稱>/`

## PWA / GitHub Pages 子目錄相容性

本系統使用相對路徑：
- `./index.html`
- `./app.js`
- `./styles.css`
- `./data.js`
- `./assets/...`

因此即使部署在：
`https://帳號.github.io/repository-name/`
也可正常載入。

Service Worker 的 scope 會跟著目前網站路徑，不會跨出 repository 子目錄。

## 重要：不要公開同步密鑰

正式的 Apps Script `SHARED_TOKEN` 不要放進公開 GitHub repository。

本 GitHub Pages 發布版已移除 `apps-script/` 部署範例資料夾。
如果你需要部署 Apps Script，請使用你私下保存的 V22 原始 ZIP 內版本，再自行填入密鑰。

## 更新流程

之後每次拿到新版：

1. 備份目前 repository。
2. 用新版檔案覆蓋：
   - index.html
   - app.js
   - styles.css
   - data.js
   - taiwan_data.js
   - license_data.js
   - manifest.webmanifest
   - sw.js
   - offline.html
   - assets/
   - icons/
3. Commit。
4. Push。
5. GitHub Pages 會自動更新。

若瀏覽器仍顯示舊版，可重新整理或重新開啟 PWA。
