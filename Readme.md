# SaoriBackend

SaoriBackend 是一個基於 Node.js 的後端應用程序，採用 MVC（模型-視圖-控制器）架構設計，適合構建可擴展的 Web API。此項目已經過測試，可以穩定運行，並支持 Docker 部署。

---

## 特性

- **MVC 架構**：分層設計，代碼易於維護。
- **MariaDB 數據庫集成**：通過 SQL 進行數據建模和操作。
- **中間件支持**：使用 Express 提供靈活的中間件管理。
- **Docker 化**：支持容器化部署，方便開發和生產環境切換。
- **環境變量支持**：通過 `.env` 文件管理敏感配置。

---

## 目錄結構

項目遵循清晰的分層結構，方便理解和開發：

```
SaoriBackend/
├── certs/             # SSL證書
├── controllers/       # 業務邏輯控制器
├── middlewares/       # Express 中間件
├── models/            # 數據模型（MariaDB）
├── routes/            # API 路由定義
├── services/          # 業務邏輯服務層
├── app.js             # 應用程序入口
├── Dockerfile         # Docker 構建文件
├── docker-compose.yml # Docker 容器編排配置
├── package.json       # 項目依賴和腳本
└── .env               # 環境變量範例文件
```

---

## 環境設置

### 1. 克隆項目

```bash
git clone https://github.com/rickwengdev/SaoriBackend.git
```

### 2. 安裝依賴

```bash
cd SaoriBackend
npm install
```

### 3. 配置環境變量

創建 `.env` 文件並設置以下變量：

```bash
DB_HOST=127.0.0.1
DB_NAME=discord_bot
DB_USER=discord_user
DB_PASSWORD=password123
API_URL=https://localhost
JWT_SECRET=secret
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
```

---

## 如何運行應用程序

### 開發模式

使用 Nodemon 啟動開發服務：

```bash
npm run dev
```

### 生產模式

以標準模式運行服務：

```bash
npm start
```

---

## Docker 部署

### 1. 構建 Docker 映像

```bash
docker build -t saori-backend .
```

### 2. 啟動服務

```bash
docker-compose up -d
```

### 3. 檢查容器狀態

```bash
docker ps
```

---

## 項目架構詳解

### 1. Controllers（控制器）

控制器負責接收請求、處理業務邏輯並返回響應。例如：

- `UserController.js`：用戶相關的邏輯（如註冊、登錄）。

### 2. Models（數據模型）

使用 Mongoose 定義 MongoDB 的數據模型。例如：

- `User.js`：包含用戶信息的結構與校驗。

### 3. Services（服務層）

封裝複雜的業務邏輯，便於重用。例如：

- `AuthService.js`：處理 JWT 生成和驗證。

### 4. Routes（路由）

定義各個端點及其處理程序。例如：

```javascript
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.post('/login', UserController.login);
router.post('/register', UserController.register);

module.exports = router;
```

### 5. Middlewares（中間件）

用於處理請求邏輯（如身份驗證、錯誤處理）。例如：

- `AuthMiddleware.js`：校驗請求是否包含有效的 JWT。

---

## 測試

目前該項目已通過功能測試，建議後續集成單元測試框架（如 Jest 或 Mocha）進行代碼覆蓋測試。

### 常見問題排查

1. 應用程序無法啟動
    - 確保 `.env` 文件配置正確。
    - 檢查 MariaDB 是否運行。
2. Docker 問題
    - 如果 `docker-compose` 啟動失敗，檢查 Docker 服務是否正常。
3. 依賴問題
    - 使用 `npm install` 確保所有依賴安裝到位。

---

## 貢獻指南

歡迎社群參與貢獻！請遵循以下步驟：

### 1. Fork 此存儲庫

### 2. 創建功能分支

```bash
git checkout -b feature/YourFeature
```

### 3. 提交更改

```bash
git commit -m "Add YourFeature"
```

### 4. 推送分支

```bash
git push origin feature/YourFeature
```

### 5. 創建 Pull Request，等待審核與合併

---

## 許可證

目前未設置開源協議，建議後續加入 MIT 或 Apache 2.0 協議。

---

## 聯繫方式

如需技術支持或提交問題，請聯繫項目所有者或在 GitHub 上創建 Issue。

GitHub 項目連結：[SaoriBackend](https://github.com/rickwengdev/SaoriBackend)