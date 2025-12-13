# Cloudflare Pages 自動部署指南（簡化版）

## 快速開始（推薦方式）

### 第 1 步：在 GitHub 中設定密鑰

你需要在 GitHub 倉庫中設定兩個密鑰，這樣 GitHub Actions 才能自動部署到 Cloudflare。

#### 獲取 Cloudflare API Token

1. 訪問 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 用你的 Gmail 帳號登入：`nelsonnew20231126@gmail.com`
3. 進入 **設定 (Settings)** → **API Token**
4. 點擊 **Create Token**
5. 選擇 **Cloudflare Pages – Deploy** 或創建自訂 Token，需要權限：
   - Account.Cloudflare Pages: Edit
   - Account: Read

6. 複製生成的 Token（只會顯示一次！）

#### 獲取 Account ID

1. 在 Cloudflare Dashboard 首頁
2. 右側會顯示你的 **Account ID**，複製它

### 第 2 步：在 GitHub 中添加密鑰

1. 進入你的 GitHub 倉庫：https://github.com/nelsonhsu2004/Sportmap
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **New repository secret** 創建以下兩個密鑰：

   **密鑰 1：CLOUDFLARE_API_TOKEN**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: 粘貼你複製的 API Token

   **密鑰 2：CLOUDFLARE_ACCOUNT_ID**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Secret: 粘貼你的 Account ID

### 第 3 步：部署

1. 推送代碼到 GitHub：
   ```bash
   git add .
   git commit -m "Setup Cloudflare Pages deployment"
   git push origin main
   ```

2. 進入 GitHub 倉庫 → **Actions** 分頁
3. 應該會看到一個新的工作流運行
4. 等待部署完成（通常 1-3 分鐘）

5. 部署成功後，你會獲得一個 Cloudflare Pages URL：
   ```
   https://sportmap.pages.dev
   ```

## 之後的部署流程

**之後每次你推送代碼到 main 分支，GitHub Actions 會自動：**
1. ✅ 構建你的 React 應用
2. ✅ 部署到 Cloudflare Pages
3. ✅ 自動更新你的網站

## 檢查部署狀態

- **GitHub Actions 日誌**：https://github.com/nelsonhsu2004/Sportmap/actions
- **Cloudflare Pages 儀表板**：https://dash.cloudflare.com → Pages

## 常見問題

### Q: 我該去哪裡創建 API Token？
A: https://dash.cloudflare.com/profile/api-tokens

### Q: 部署失敗了怎麼辦？
A: 
1. 檢查 GitHub Actions 日誌中的錯誤信息
2. 確認 API Token 和 Account ID 正確
3. 確保你有足夠的 Cloudflare 權限

### Q: 如何自訂域名？
A: 在 Cloudflare Pages 設定中添加自訂域名（需要 Cloudflare 免費帳戶）

## 下一步

部署成功後，你可以：
- ✅ 訪問你的實時網站
- ✅ 分享 Pages URL 給別人
- ✅ 在 Cloudflare 中配置自訂域名（可選）
- ✅ 設定 SSL/TLS（Cloudflare 默認提供）

## 需要幫助？

- [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages/)
- [GitHub Actions 文檔](https://docs.github.com/en/actions)
