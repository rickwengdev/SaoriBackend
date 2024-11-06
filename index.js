require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const qs = require('qs');
const cookieParser = require('cookie-parser');
const ServerConfig = require('./models/ServerConfig');

const app = express();

// HTTPS 證書和私鑰設置
const sslOptions = {
  key: fs.readFileSync('server.key'), // 私鑰文件
  cert: fs.readFileSync('server.crt') // 證書文件
};

// 跨域請求配置，啟用 HTTPS 並允許憑證
app.use(cors({ origin: `${process.env.API_URL}:8080`, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// JWT 驗證中間件
const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ message: '需要存取權杖' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: '權杖無效' });
    req.user = user;
    next();
  });
};

// MongoDB 連接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('已連接到 MongoDB'))
  .catch(err => console.error('連接 MongoDB 失敗', err));

// 基本測試路由
app.get('/', (req, res) => {
  res.send('Discord Bot Backend API');
});

// Discord OAuth2 認證路由
app.get('/auth/discord', (req, res) => {
  const redirectUri = encodeURIComponent(`${process.env.API_URL}:3000/callback`);
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=identify guilds`;
  res.redirect(authUrl);
});

// OAuth2 回調，生成 JWT 並設置在 HttpOnly Cookie
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: '缺少授權碼' });

  try {
    const data = qs.stringify({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.API_URL}:3000/callback`,
    });

    const response = await axios.post('https://discord.com/api/oauth2/token', data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = response.data;

    const userInfo = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const token = jwt.sign(
      { id: userInfo.data.id, username: userInfo.data.username, access_token },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'None',
    });

    res.redirect(`${process.env.API_URL}:8080/dashboard`);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: '認證失敗' });
  }
});

// 後端 /auth/status 路由
app.get('/auth/status', authenticateToken, (req, res) => {
  res.json({ isLoggedIn: true });
});

// 登出路由，清除 JWT Cookie
app.post('/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ message: '已登出' });
});

// 獲取用戶的伺服器清單，只返回用戶有管理員權限的伺服器
app.get('/user/guilds', authenticateToken, async (req, res) => {
  const { access_token } = req.user;
  try {
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const adminGuilds = guildsResponse.data.filter((guild) => (guild.permissions & 0x8) === 0x8);
    res.json(adminGuilds);
  } catch (error) {
    console.error('無法獲取伺服器清單:', error.response?.data || error.message);
    res.status(500).json({ message: '獲取伺服器清單失敗' });
  }
});

// 檢查機器人是否在伺服器中的 API
app.get('/servers/:serverId/check-bot', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const botUserId = process.env.DISCORD_CLIENT_ID;

  try {
    const response = await axios.get(`https://discord.com/api/v10/guilds/${serverId}/members/${botUserId}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });

    res.json({ botInServer: true });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.json({ botInServer: false });
    } else {
      console.error('檢查機器人狀態時出錯:', error.response?.data || error.message);
      res.status(500).json({ message: '檢查機器人狀態失敗' });
    }
  }
});

// 獲取伺服器的 bot 設置
app.get('/servers/:serverId/config', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  try {
    const config = await ServerConfig.findOne({ serverId });
    if (!config) return res.status(404).json({ message: '找不到設置' });
    res.json({ serverName: config.serverName, config: config.settings });
  } catch (error) {
    res.status(500).json({ message: '載入設置失敗' });
  }
});

// 保存伺服器的 bot 設置
app.post('/servers/:serverId/config', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const settings = req.body;

  try {
    let config = await ServerConfig.findOne({ serverId });
    if (!config) {
      config = new ServerConfig({ serverId, settings });
    } else {
      config.settings = settings;
    }
    await config.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: '保存設置失敗' });
  }
});

// 獲取 Discord Bot 頭像 URL
app.get('/api/bot-avatar', async (req, res) => {
  try {
    const response = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    });
    const { id, avatar } = response.data;
    const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
    res.json({ avatarUrl });
  } catch (error) {
    console.error('無法獲取 Bot 頭像:', error.response?.data || error.message);
    res.status(500).json({ error: '獲取 Bot 頭像失敗' });
  }
});

// 獲取用戶頭像 URL
app.get('/api/user-avatar', authenticateToken, async (req, res) => {
  const { access_token } = req.user;

  try {
    const response = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id, avatar } = response.data;
    const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
    res.json({ avatarUrl });
  } catch (error) {
    console.error('無法獲取用戶頭像:', error.response?.data || error.message);
    res.status(500).json({ error: '獲取用戶頭像失敗' });
  }
});

// 獲取伺服器的頻道列表（包括文字頻道和語音頻道）
app.get('/servers/:serverId/channels', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const accessToken = process.env.DISCORD_BOT_TOKEN; // 只有機器人可以獲取伺服器頻道列表

  try {
    const response = await axios.get(`https://discord.com/api/guilds/${serverId}/channels`, {
      headers: { Authorization: `Bot ${accessToken}` },
    });

    res.json(response.data); // 返回頻道列表
  } catch (error) {
    console.error('Failed to fetch channels:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch channels' });
  }
});

// 獲取伺服器的身份組列表
app.get('/servers/:serverId/roles', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const accessToken = process.env.DISCORD_BOT_TOKEN; // 只有機器人可以獲取伺服器的身份組列表

  try {
    const response = await axios.get(`https://discord.com/api/guilds/${serverId}/roles`, {
      headers: { Authorization: `Bot ${accessToken}` },
    });

    res.json(response.data); // 返回身份組列表
  } catch (error) {
    console.error('Failed to fetch roles:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

// 獲取伺服器的表情符號列表
app.get('/servers/:serverId/emojis', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const accessToken = process.env.DISCORD_BOT_TOKEN; // 使用機器人 token 獲取表情符號

  try {
    const response = await axios.get(`https://discord.com/api/guilds/${serverId}/emojis`, {
      headers: { Authorization: `Bot ${accessToken}` },
    });

    res.json(response.data); // 返回表情符號列表
  } catch (error) {
    console.error('Failed to fetch emojis:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch emojis' });
  }
});

// 獲取伺服器的當前設置預覽，並解析 ID 為名稱
app.get('/servers/:serverId/preview-config', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  
  try {
    // 查找伺服器配置
    const config = await ServerConfig.findOne({ serverId });
    if (!config) {
      return res.status(404).json({ message: '找不到設置' });
    }

    // 並行請求 Discord API 以獲取頻道、角色和表情符號
    const [channelsResponse, rolesResponse, emojisResponse] = await Promise.all([
      axios.get(`https://discord.com/api/guilds/${serverId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }),
      axios.get(`https://discord.com/api/guilds/${serverId}/roles`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }),
      axios.get(`https://discord.com/api/guilds/${serverId}/emojis`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }),
    ]);

    const channels = channelsResponse.data;
    const roles = rolesResponse.data;
    const emojis = emojisResponse.data;

    // 創建映射以便快速查找 ID 對應的名稱
    const channelMap = channels.reduce((map, channel) => {
      map[channel.id] = channel.name;
      return map;
    }, {});

    const roleMap = roles.reduce((map, role) => {
      map[role.id] = role.name;
      return map;
    }, {});

    const emojiMap = emojis.reduce((map, emoji) => {
      map[emoji.id] = emoji.name || `https://cdn.discordapp.com/emojis/${emoji.id}.png`;
      return map;
    }, {});

    // 確認 reactionRoles 是否為 Map 結構並轉換為 Map
    if (!(config.settings.reactionRoles instanceof Map)) {
      config.settings.reactionRoles = new Map(Object.entries(config.settings.reactionRoles || {}));
    }

    // 構建預覽配置
    const reactionRoles = Array.from(config.settings.reactionRoles.entries()).map(([key, roleData]) => {
      const channelName = channelMap[roleData.channel] || 'N/A';
      if (!roleData.channel) {
        console.warn(`Missing channel ID for reaction role messageId: ${key}`);
      }
      return {
        channel: channelName,
        messageId: key || 'N/A',
        emoji: emojiMap[roleData.emoji] || roleData.emoji || 'N/A',
        role: roleMap[roleData.role] || 'N/A',
      };
    });

    const preview = {
      welcomeChannel: channelMap[config.settings.welcomeChannel] || 'N/A',
      leaveChannel: channelMap[config.settings.leaveChannel] || 'N/A',
      reactionRoles: reactionRoles,
      baseVoiceChannel: channelMap[config.settings.baseVoiceChannel] || 'N/A',
      logChannel: channelMap[config.settings.logChannel] || 'N/A',
    };

    res.json(preview);
  } catch (error) {
    console.error('Error fetching preview configuration:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to load preview configuration' });
    }
  }
});

// 設定伺服器的 bot 設置
app.post('/servers/:serverId/config', async (req, res) => {
  const { serverId } = req.params; // 獲取伺服器 ID
  const config = req.body; // 從請求中獲取配置數據

  try {
    // 查找伺服器配置，若不存在則創建一條新的記錄
    let serverConfig = await ServerConfig.findOne({ serverId });
    if (!serverConfig) {
      serverConfig = new ServerConfig({ serverId, settings: config });
    } else {
      serverConfig.settings = config; // 更新現有的配置
    }
    await serverConfig.save(); // 保存或更新到資料庫
    res.json({ success: true, message: 'Configuration saved successfully!' });
  } catch (error) {
    console.error('Error saving configuration:', error);
    res.status(500).json({ success: false, message: 'Failed to save configuration.' });
  }
});

// 保存歡迎和離開消息設置
app.post('/servers/:serverId/config/welcome-leave', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const { welcomeChannel, leaveChannel } = req.body;

  try {
    let config = await ServerConfig.findOne({ serverId });
    if (!config) {
      config = new ServerConfig({ serverId, settings: { welcomeChannel, leaveChannel } });
    } else {
      config.settings.welcomeChannel = welcomeChannel;
      config.settings.leaveChannel = leaveChannel;
    }
    await config.save();
    res.json({ success: true, message: 'Welcome/Leave settings saved successfully!' });
  } catch (error) {
    console.error('Failed to save Welcome/Leave settings:', error);
    res.status(500).json({ message: 'Failed to save Welcome/Leave settings.' });
  }
});

// 保存動態語音頻道設置
app.post('/servers/:serverId/config/dynamic-voice', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const { baseVoiceChannel } = req.body;

  try {
    let config = await ServerConfig.findOne({ serverId });
    if (!config) {
      config = new ServerConfig({ serverId, settings: { baseVoiceChannel } });
    } else {
      config.settings.baseVoiceChannel = baseVoiceChannel;
    }
    await config.save();
    res.json({ success: true, message: 'Dynamic Voice Channel settings saved successfully!' });
  } catch (error) {
    console.error('Failed to save Dynamic Voice Channel settings:', error);
    res.status(500).json({ message: 'Failed to save Dynamic Voice Channel settings.' });
  }
});

// 保存 Log 設置
app.post('/servers/:serverId/config/log-settings', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const { logChannel } = req.body;

  if (!logChannel) {
    return res.status(400).json({ error: 'Log channel is required' });
  }

  try {
    let config = await ServerConfig.findOne({ serverId });
    if (!config) {
      config = new ServerConfig({ serverId, settings: { logChannel } });
    } else {
      config.settings.logChannel = logChannel;
    }
    await config.save();
    res.json({ success: true, message: 'Log settings saved successfully!' });
  } catch (error) {
    console.error('Failed to save Log settings:', error);
    res.status(500).json({ message: 'Failed to save Log settings.' });
  }
});

// 保存反應角色設置
app.post('/servers/:serverId/config/reaction-role', authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const { channel, messageId, emoji, role } = req.body;

  try {
    // 查找伺服器配置
    let config = await ServerConfig.findOne({ serverId });
    if (!config) {
      console.log(`Configuration not found for serverId: ${serverId}. Creating new configuration.`);
      // 如果配置不存在，創建新配置並初始化 reactionRoles 為空對象
      config = new ServerConfig({ serverId, settings: { reactionRoles: {} } });
    } else {
      console.log(`Found configuration for serverId: ${serverId}`);
    }

    // 確保 reactionRoles 是普通對象
    config.settings.reactionRoles = config.settings.reactionRoles || {};

    // 使用 messageId 作為鍵，設置反應角色配置
    config.settings.reactionRoles[messageId] = { channel, emoji, role };

    // 標記為已修改並保存
    config.markModified('settings.reactionRoles');
    await config.save();
    res.json({ success: true, message: 'Reaction Role settings saved successfully!' });
  } catch (error) {
    console.error('Failed to save Reaction Role settings:', error);
    res.status(500).json({ message: 'Failed to save Reaction Role settings.' });
  }
});

// 刪除指定 messageId 的反應角色
app.delete('/servers/:serverId/config/reaction-role/:messageId', authenticateToken, async (req, res) => {
  const { serverId, messageId } = req.params;
  
  try {
    const config = await ServerConfig.findOne({ serverId });
    if (!config) {
      console.log(`Server configuration not found for serverId: ${serverId}`);
      return res.status(404).json({ message: '伺服器配置未找到' });
    }

    // 確認 reactionRoles 是否為 Map 結構並轉換為 Map（若為普通對象）
    if (!(config.settings.reactionRoles instanceof Map)) {
      console.log('Converting reactionRoles to Map for compatibility.');
      config.settings.reactionRoles = new Map(Object.entries(config.settings.reactionRoles || {}));
    }

    // 嘗試刪除指定 messageId 的 reaction role
    if (config.settings.reactionRoles.has(messageId)) {
      config.settings.reactionRoles.delete(messageId);
      console.log(`Deleted reaction role for messageId:${messageId}`);
    } else {
      console.log(`No reaction role found for messageId:${messageId}`);
    }

    // 標記為已修改並保存
    config.markModified('settings.reactionRoles');
    await config.save();

    res.json({ success: true, message: 'Reaction Role deleted successfully!' });
  } catch (error) {
    console.error('刪除 reaction role 時發生錯誤:', error);
    res.status(500).json({ message: 'Failed to delete Reaction Role.' });
  }
});

// 啟動 HTTPS 伺服器
const PORT = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server is running on ${process.env.API_URL}:${PORT}`);
});