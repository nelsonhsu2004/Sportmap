# Cloudflare Pages 部署問題診斷

## 問題
收到 HTTP ERROR 404 - 找不到網頁

## 可能的原因和解決方案

### 1️⃣ 檢查 Cloudflare Pages 專案設定

進入：https://dash.cloudflare.com/pages → sportmap

**檢查項目：**

#### 構建設定 (Build Settings)
- [ ] Build command: `npm run build`
- [ ] Build output directory: `build`
- [ ] Root directory: `/` (或留空)
- [ ] Node version: `18` 或更高

#### 環境變數 (Environment Variables)
- [ ] 無需特殊設定（除非連接後端 API）

### 2️⃣ 查看部署日誌

在 Deployments (部署) 分頁：

1. 找到最新的部署
2. 點擊查看詳細信息
3. 尋找 **Build log** (構建日誌) 分頁
4. 檢查是否有錯誤信息

**常見的構建錯誤：**
- `npm: command not found` → Node.js 版本問題
- `Cannot find module` → 依賴未安裝
- `React not found` → package.json 配置有誤

### 3️⃣ 強制重新部署

如果日誌看起來正常，嘗試強制重新部署：

1. 在 Deployments 分頁
2. 找到最新部署
3. 點擊 "..." (三點菜單)
4. 選擇 "Retry deployment" (重試部署)

**或者推送新代碼到 GitHub：**
```bash
git add .
git commit -m "Trigger Cloudflare rebuild"
git push origin main
```

### 4️⃣ 檢查 public 文件夾

確保你有以下文件在 `public/` 文件夾：
- [ ] `index.html` ✓ (已有)
- [ ] `_redirects` ✓ (已有)
- [ ] `_headers` ✓ (已有)
- [ ] `favicon.ico` ✓ (已有)
- [ ] `manifest.json` ✓ (已有)

### 5️⃣ 檢查本地構建

在本地確認構建沒問題：
```bash
npm run build
```

應該看到：
- ✅ "Compiled successfully"
- ✅ build/index.html 存在
- ✅ build/static/ 文件夾有內容

### 6️⃣ 如果還是不行

可能是 Cloudflare Pages 同步有延遲。嘗試：

1. **清除瀏覽器快取**
   - 按 Ctrl + Shift + Delete
   - 清除 cookies 和 cached images

2. **等待 24 小時**
   - 有時 Cloudflare 需要時間同步 DNS

3. **檢查其他部署**
   - 進入 https://sportmap.pages.dev
   - 確認你訪問的是正確的 URL

## 需要提供的信息給 Cloudflare 支持

如果以上都無法解決，請保存以下信息：
1. 部署 URL
2. 部署日誌 (screenshot)
3. 你的 Account ID
4. GitHub 倉庫 URL

## 快速檢查列表

- [ ] 本地構建成功 (`npm run build`)
- [ ] `build/index.html` 存在
- [ ] GitHub 倉庫有最新代碼
- [ ] Cloudflare Pages 專案已連接到 GitHub
- [ ] 最新部署顯示 "Success"
- [ ] 構建日誌沒有錯誤
- [ ] 訪問 https://sportmap.pages.dev (注意：不是 www)
