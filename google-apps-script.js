// ===================================================================
// Google Apps Script for Sports Store Comments
// 
// 使用步驟：
// 1. 開啟 Google Sheet
// 2. 點擊 [擴充功能] → [Apps Script]
// 3. 複製此檔案的全部內容到 Apps Script 編輯器
// 4. 修改 SHEET_ID 和 SHEET_NAME
// 5. 點擊 [部署] → [新部署] → 選擇 [Web 應用程式]
// 6. 執行身分選擇 "你的帳號"，誰可以存取選擇 "任何人"
// 7. 複製部署的網址到 React 代碼中
// ===================================================================

/**
 * doOptions: 處理 CORS preflight 請求
 * 解決跨域請求被阻止的問題
 */
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);
  output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

/**
 * doPost: 接收 POST 請求並儲存留言到 Google Sheet
 * 期望的請求格式:
 * {
 *   "timestamp": "2024-12-13 14:30:00",
 *   "storeName": "店家名稱",
 *   "storeAddress": "店家地址",
 *   "comment": "留言內容"
 * }
 */
function doPost(e) {
  try {
    // 解析請求內容
    const data = JSON.parse(e.postData.contents);
    
    // 設定工作表資訊
    const SHEET_ID = '1y5KhwvyyiULS11S2W1nOMH8KxYw9MU6xo0gQhB969ic'; // 替換成你的 Google Sheet ID
    const SHEET_NAME = 'Comments'; // 工作表名稱（如果不存在會自動建立）
    
    // 開啟 Google Sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // 如果工作表不存在，建立新工作表
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // 添加標題行
      sheet.appendRow(['時間', '店家名稱', '店家地址', '留言內容']);
    }
    
    // 添加新的留言行
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('zh-TW'),
      data.storeName || '',
      data.storeAddress || '',
      data.comment || ''
    ]);
    
    // 返回成功回應
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '留言已儲存',
      timestamp: new Date().toLocaleString('zh-TW')
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 返回錯誤回應
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * doGet: 取得所有留言（可選功能）
 * 用於讀取已儲存的所有留言
 */
function doGet(e) {
  try {
    const SHEET_ID = '1y5KhwvyyiULS11S2W1nOMH8KxYw9MU6xo0gQhB969ic'; // 替換成你的 Google Sheet ID
    const SHEET_NAME = 'Comments';
    
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: '工作表不存在'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 取得所有資料
    const data = sheet.getDataRange().getValues();
    
    // 跳過標題行，轉換為物件陣列
    const comments = data.slice(1).map(row => ({
      timestamp: row[0],
      storeName: row[1],
      storeAddress: row[2],
      comment: row[3]
    }));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      count: comments.length,
      data: comments
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * testPost: 測試 POST 功能（可選）
 * 在 Apps Script 編輯器中直接執行此函數來測試
 */
function testPost() {
  const testData = {
    timestamp: new Date().toLocaleString('zh-TW'),
    storeName: '測試店家',
    storeAddress: '台北市信義區',
    comment: '這是一個測試留言'
  };
  
  // 模擬 POST 請求
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const response = doPost(e);
  Logger.log('測試結果:', response.getContent());
}
