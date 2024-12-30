const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加載環境變量
dotenv.config();

// 創建 MariaDB 連接池
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',   // 默認連接 localhost
  user: process.env.DB_USER || 'root',       // 默認用戶名
  password: process.env.DB_PASSWORD || '',   // 默認無密碼
  database: process.env.DB_NAME || 'test',   // 默認數據庫名稱
  port: process.env.DB_PORT || 3306,         // 默認端口 3306
  waitForConnections: true,
  connectionLimit: 10,                       // 最大連接數量
  queueLimit: 0,                             // 無限制隊列數量
});

/**
 * 測試數據庫連接
 * @returns {Promise<void>}
 */
const testConnection = async () => {
  try {
    const [result] = await db.query('SELECT 1 + 1 AS test');
    console.log('Database connected successfully. Test result:', result[0].test);
  } catch (error) {
    console.error('Database connection failed:');
    console.error(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.error(`Database: ${process.env.DB_NAME || 'test'}`);
    console.error(`Error: ${error.message}`);
    process.exit(1); // 退出應用以防止後續代碼執行
  }
};

// 測試連接（僅限開發或調試模式）
if (process.env.NODE_ENV !== 'production') {
  testConnection();
}

module.exports = db;