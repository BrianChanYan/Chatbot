# OfflineChat 完整安裝指南

這是一份給完全新手的詳細安裝教學，只要照著步驟一步一步做，就能成功架設這個 AI 聊天服務。

---

## 目錄
1. [系統需求](#系統需求)
2. [步驟一：安裝 Node.js](#步驟一安裝-nodejs)
3. [步驟二：安裝 Ollama](#步驟二安裝-ollama)
4. [步驟三：下載 AI 模型](#步驟三下載-ai-模型)
5. [步驟四：下載專案檔案](#步驟四下載專案檔案)
6. [步驟五：啟動服務](#步驟五啟動服務)
7. [常見問題](#常見問題)

---

## 系統需求

- macOS 或 Windows 或 Linux 作業系統
- 至少 8GB 記憶體（建議 16GB）
- 至少 10GB 硬碟空間
- 穩定的網路連線

---

## 步驟一：安裝 Node.js

Node.js 是執行這個程式所需的環境。

### macOS 使用者

1. 開啟瀏覽器，前往 https://nodejs.org/
2. 點擊綠色的 "LTS" 按鈕下載（建議下載 LTS 版本）
3. 下載完成後，雙擊 `.pkg` 檔案
4. 按照安裝程式的指示，一直點「繼續」和「安裝」
5. 輸入你的 Mac 密碼完成安裝

### Windows 使用者

1. 開啟瀏覽器，前往 https://nodejs.org/
2. 點擊綠色的 "LTS" 按鈕下載（建議下載 LTS 版本）
3. 下載完成後，雙擊 `.msi` 檔案
4. 按照安裝程式的指示，一直點「Next」
5. 在「Tools for Native Modules」的選項打勾
6. 完成安裝

### 驗證安裝

1. **macOS**: 打開「終端機」（在「應用程式」→「工具程式」裡）
2. **Windows**: 打開「命令提示字元」（按 Windows 鍵，搜尋 "cmd"）
3. 輸入以下指令並按 Enter：
   ```bash
   node --version
   ```
4. 如果看到類似 `v20.x.x` 的版本號，就代表安裝成功！

---

## 步驟二：安裝 Ollama

Ollama 是執行 AI 模型的核心軟體。

### macOS 使用者

1. 開啟瀏覽器，前往 https://ollama.ai
2. 點擊 "Download" 按鈕
3. 點擊 "Download for macOS"
4. 下載完成後，雙擊 `.dmg` 檔案
5. 將 Ollama 圖示拖曳到「應用程式」資料夾
6. 打開「應用程式」資料夾，雙擊 Ollama 啟動

### Windows 使用者

1. 開啟瀏覽器，前往 https://ollama.ai
2. 點擊 "Download" 按鈕
3. 點擊 "Download for Windows"
4. 下載完成後，雙擊 `.exe` 檔案
5. 按照安裝程式的指示完成安裝
6. 從開始選單啟動 Ollama

### Linux 使用者

1. 打開終端機
2. 執行以下指令：
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

### 驗證安裝

1. 打開終端機（macOS/Linux）或命令提示字元（Windows）
2. 輸入：
   ```bash
   ollama --version
   ```
3. 如果看到版本號，就代表安裝成功！

---

## 步驟三：下載 AI 模型

現在要下載實際的 AI 模型（Qwen2.5:14b）。

1. 確保 Ollama 正在執行（macOS 使用者可以在螢幕上方工作列看到 Ollama 圖示）
2. 打開終端機或命令提示字元
3. 輸入以下指令並按 Enter：
   ```bash
   ollama pull qwen2.5:14b
   ```
4. **等待下載完成**（大約需要 5-15 分鐘，檔案很大約 9GB）
5. 下載完成後，輸入以下指令測試：
   ```bash
   ollama run qwen2.5:14b
   ```
6. 如果看到 AI 回應，輸入 `/bye` 離開測試

---

## 步驟四：下載專案檔案

### 方法一：如果你有 Git

1. 打開終端機或命令提示字元
2. 切換到你想放專案的位置，例如桌面：
   ```bash
   cd ~/Desktop
   ```
3. 下載專案：
   ```bash
   git clone [你的專案網址]
   ```

### 方法二：手動下載（推薦給新手）

1. 確保你已經有專案資料夾（假設在桌面上叫 `OfflineChat`）
2. 資料夾結構應該像這樣：
   ```
   OfflineChat/
   ├── app/
   ├── data/
   ├── docs/
   ├── scripts/
   ├── server/
   └── README.md
   ```

---

## 步驟五：啟動服務

### 自動啟動（最簡單）

#### macOS/Linux 使用者

1. 打開終端機
2. 切換到專案目錄（假設專案在桌面）：
   ```bash
   cd ~/Desktop/OfflineChat
   ```
3. 給啟動腳本執行權限（**只需要做一次**）：
   ```bash
   chmod +x scripts/start.sh
   chmod +x scripts/stop.sh
   ```
4. 啟動服務：
   ```bash
   ./scripts/start.sh
   ```
5. 瀏覽器會自動開啟 http://localhost:8080

#### Windows 使用者

1. 先啟動 Ollama 服務：
   - 打開命令提示字元
   - 輸入：`ollama serve`
   - **保持這個視窗開著**

2. 開啟另一個命令提示字元視窗
3. 切換到專案目錄：
   ```bash
   cd %USERPROFILE%\Desktop\OfflineChat
   ```
4. 啟動服務：
   ```bash
   node server/server.js
   ```
5. 打開瀏覽器，前往 http://localhost:8080

### 手動啟動

如果自動啟動腳本無法使用，可以手動啟動：

#### 第一步：啟動 Ollama

打開一個終端機視窗，輸入：
```bash
ollama serve
```
**重要：保持這個視窗開著！**

#### 第二步：啟動聊天服務

打開**另一個**終端機視窗：

1. 切換到專案目錄：
   ```bash
   cd ~/Desktop/OfflineChat
   ```
   （Windows 使用者用 `cd %USERPROFILE%\Desktop\OfflineChat`）

2. 啟動伺服器：
   ```bash
   node server/server.js
   ```

3. 看到 "Server running at http://localhost:8080" 就代表成功了！

#### 第三步：打開瀏覽器

在瀏覽器網址列輸入：
```
http://localhost:8080
```

恭喜！你應該可以看到聊天介面了！

---

## 停止服務

### 使用停止腳本

#### macOS/Linux
```bash
cd ~/Desktop/OfflineChat
./scripts/stop.sh
```

#### Windows
在執行 `node server/server.js` 的視窗按 `Ctrl + C`

### 手動停止

1. 在執行 `ollama serve` 的視窗按 `Ctrl + C`
2. 在執行 `node server/server.js` 的視窗按 `Ctrl + C`

---

## 常見問題

### Q1: 顯示「連線錯誤」

**解決方法：**
1. 確認 Ollama 正在執行（檢查是否有執行 `ollama serve`）
2. 重新啟動 Ollama：
   ```bash
   ollama serve
   ```

### Q2: 顯示「Port 8080 已被使用」

**解決方法：**
1. 改用其他 port，編輯 `server/server.js`：
   ```javascript
   const PORT = 8080;  // 改成 8081 或其他數字
   ```
2. 或是關閉佔用 8080 port 的程式

### Q3: 瀏覽器顯示「無法連線」

**解決方法：**
1. 確認伺服器正在執行（應該看到 "Server running at..." 訊息）
2. 檢查網址是否正確：`http://localhost:8080`
3. 試試看用 `http://127.0.0.1:8080`

### Q4: AI 回應很慢

這是正常的，因為：
- AI 模型很大，需要時間計算
- 第一次回應會比較慢（模型載入）
- 之後的回應會快一些

**建議：**
- 確保電腦至少有 8GB 記憶體
- 關閉其他佔用資源的程式

### Q5: 想要更換其他 AI 模型

1. 查看可用模型：https://ollama.ai/library
2. 下載新模型，例如：
   ```bash
   ollama pull llama2
   ```
3. 修改 `app/js/app.js` 第 2 行：
   ```javascript
   const MODEL = 'llama2';  // 改成你要的模型
   ```
4. 重新啟動服務

### Q6: 如何從其他裝置訪問（例如手機）

1. 確保裝置連接到同一個 Wi-Fi
2. 找出電腦的 IP 位址：
   - **macOS**: 終端機執行 `ipconfig getifaddr en0`
   - **Windows**: 命令提示字元執行 `ipconfig`，找 IPv4 位址
3. 在手機瀏覽器輸入：`http://[你的IP]:8080`
   例如：`http://192.168.1.100:8080`

---

## 完整操作流程總結

每次要使用時，按照以下步驟：

1. ✅ 確認 Ollama 正在執行
2. ✅ 執行 `cd ~/Desktop/OfflineChat`（切換到專案目錄）
3. ✅ 執行 `./scripts/start.sh`（macOS/Linux）或 `node server/server.js`（Windows）
4. ✅ 打開瀏覽器前往 http://localhost:8080
5. ✅ 開始聊天！

使用完畢後：
1. ✅ 執行 `./scripts/stop.sh` 或按 `Ctrl + C` 停止服務

---

## 需要幫助？

如果遇到任何問題：

1. 檢查 [常見問題](#常見問題) 章節
2. 查看 [完整文檔](README.md)
3. 確認所有步驟都正確執行
4. 重新啟動電腦試試看（有時候真的有用！）

---

**恭喜你完成設定！現在可以開始使用你的本地 AI 聊天服務了！** 🎉
