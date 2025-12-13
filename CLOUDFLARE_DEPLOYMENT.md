# Cloudflare 部署指南

## 準備工作

### 1. 安裝 Wrangler CLI
```bash
npm install -g @cloudflare/wrangler
```

### 2. 登入 Cloudflare
```bash
wrangler login
```
這會在瀏覽器中打開登入頁面，選擇允許存取。

### 3. 取得你的 Account ID
登入後，執行以下命令查看你的帳戶信息：
```bash
wrangler whoami
```

## 部署步驟

### 方式 1：部署到 Cloudflare Pages（前端）

1. **更新 wrangler.json**
   - 將 `YOUR_DOMAIN` 替換成你的域名（如果有的話）

2. **構建並部署**
   ```bash
   npm run deploy:pages
   ```

3. **部署後會得到一個 URL**，例如：
   ```
   https://sportmap.pages.dev
   ```

### 方式 2：部署到 Cloudflare Workers（API）

1. **更新 wrangler.toml**
   - 將 `YOUR_ACCOUNT_ID` 替換成你的 Account ID
   - 如果使用自訂域名，填入 `YOUR_ZONE_ID` 和 `YOUR_DOMAIN`

2. **部署**
   ```bash
   npm run deploy:workers
   ```

3. **部署後會得到一個 Worker URL**，例如：
   ```
   https://sportmap.YOUR_ACCOUNT.workers.dev
   ```

## 環境變數設定

### 前端環境變數 (.env)
```
REACT_APP_API_URL=https://sportmap-api.workers.dev
```

### 後端環境變數 (wrangler.toml)
```
[env.production]
vars = { API_URL = "https://sportmap-api.workers.dev" }
```

## 配置說明

### wrangler.toml
- `name`: 你的 Worker 名稱
- `account_id`: Cloudflare 帳戶 ID
- `route`: 自訂域名時的路由
- `zone_id`: 自訂域名時的 Zone ID

### 更新 React API 調用

在 `Tmsind.js` 中修改 API 端點：

```javascript
// 本地開發
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://sportmap-api.workers.dev';

const response = await fetch(`${API_URL}/tmsind`);
```

## 部署檢查清單

- [ ] 安裝並登入 Wrangler CLI
- [ ] 取得 Cloudflare Account ID
- [ ] 構建前端應用 (`npm run build`)
- [ ] 部署到 Pages (`npm run deploy:pages`)
- [ ] 部署 API 到 Workers (`npm run deploy:workers`)
- [ ] 驗證前後端連接正常

## 常見問題

### 1. 部署後前端無法連接後端
- 檢查環境變數設定是否正確
- 確認 API URL 在生產環境中是否正確

### 2. CORS 錯誤
- 在後端 API 添加 CORS 頭
- Cloudflare Workers 默認允許跨域請求

### 3. 需要更新代碼後重新部署
```bash
# 重新構建並部署
npm run build
npm run deploy:pages
npm run deploy:workers
```

## 更多資源

- [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文檔](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文檔](https://developers.cloudflare.com/workers/wrangler/)
