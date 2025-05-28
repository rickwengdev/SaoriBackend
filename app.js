require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const db = require('./models/db');
const DatabaseService = require('./services/checkAndCreateTable');
const Logger = require('./services/errorhandleService');

// 路由
const authRoutes = require('./routes/authRoutes');
const botRoutes = require('./routes/botRoutes');
const userRoutes = require('./routes/userRoutes');
const channelRoutes = require('./routes/channelRoutes');
const welcomeLeaveRoutes = require('./routes/welcomeLeaveRoutes');
const logsRoutes = require('./routes/logsRoutes');
const DynamicVoiceChannelRoutes = require('./routes/dynamicVoiceChannelRoutes');
const reactionRoleRoutes = require('./routes/reactionRoleRoutes');
const serverRoutes = require('./routes/serverRoutes');
const trackingMembersRoutes = require('./routes/trackingMembersRoutes');

const app = express();

// HTTPS certificate setup
const sslOptions = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
};

// Middleware
app.use(cors({ origin: `${process.env.API_URL}`, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 添加 morgan 中間件，使用自定義 Logger 實例
app.use(
  morgan('combined', {
    stream: {
      write: (message) => Logger.info(message.trim()),
    },
  })
);

// 使用日誌
Logger.info('Application is starting...');
Logger.error('This is an error message');

// 測試 MariaDB 連接
async function waitForMariaDB(retries = 10, interval = 3000) {
  while (retries > 0) {
    try {
      const conn = await db.getConnection();
      Logger.info('MariaDB connection successful');
      conn.release();
      return;
    } catch (err) {
      Logger.warn(`Waiting for MariaDB... Retries left: ${retries - 1}`);
      retries--;
      await new Promise(res => setTimeout(res, interval));
    }
  }
  Logger.error('Failed to connect to MariaDB after multiple attempts');
  process.exit(1);
}

// Wait for MariaDB connection
(async () => {
  await waitForMariaDB();
})();

// Initialize database tables
(async () => {
  try {
    await DatabaseService.checkAndCreateAllTables();
    Logger.info('All tables checked and initialized');
  } catch (err) {
    Logger.error(`Error initializing database tables: ${err.message}`);
    process.exit(1);
  }
})();

// Routes
app.use('/auth', authRoutes);
app.use('/bot', botRoutes);
app.use('/user', userRoutes);
app.use('/api', channelRoutes);
app.use('/api', welcomeLeaveRoutes);
app.use('/api', logsRoutes);
app.use('/api', DynamicVoiceChannelRoutes);
app.use('/api', reactionRoleRoutes);
app.use('/server', serverRoutes);
app.use('/api', trackingMembersRoutes);

// 全局錯誤處理
app.use((err, req, res, next) => {
  Logger.error(`Global error handler: ${err.stack || err.message || err}`);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
});

// 捕獲未處理的異常
process.on('uncaughtException', (err) => {
  Logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// 捕獲未處理的拒絕
process.on('unhandledRejection', (reason, promise) => {
  Logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(PORT, () => {
  Logger.info(`Server is running on ${process.env.API_URL}:${PORT}`);
});