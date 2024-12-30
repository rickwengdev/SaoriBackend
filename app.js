require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const db = require('./models/db');
const DatabaseService = require('./services/checkAndCreateTable');


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

const app = express();

// HTTPS certificate setup
const sslOptions = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
};

// Middleware
app.use(cors({ origin: `${process.env.API_URL}:8080`, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev')); // 添加日誌中間件

// 測試 MariaDB 連接
(async () => {
  try {
    const conn = await db.getConnection();
    console.log('MariaDB connection successful');
    conn.release();
  } catch (err) {
    console.error('Failed to connect to MariaDB:', err);
    process.exit(1); // 終止應用程式
  }
})();

// Initialize database tables
(async () => {
  try {
    await DatabaseService.checkAndCreateAllTables();
    console.log('All tables checked and initialized');
  } catch (err) {
    console.error('Error initializing database tables:', err.message);
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

// 全局錯誤處理
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack || err.message || err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});