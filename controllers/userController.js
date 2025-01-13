const axios = require('axios');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class UserController {
  constructor() {
    this.discordConfig = {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      botToken: process.env.DISCORD_BOT_TOKEN,
    };
  }

  /**
   * 獲取管理員所管理的伺服器列表
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  async getGuilds(req, res) {
    const { access_token } = req.user; // 獲取用戶授權令牌

    try {
      Logger.info('[UserController] Fetching guilds for the user');
      
      // 調用 Discord API 獲取伺服器列表
      const response = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      // 篩選出用戶具有管理員權限的伺服器
      const adminGuilds = response.data.filter((guild) => (guild.permissions & 0x8) === 0x8);

      Logger.info(`[UserController] Successfully fetched ${adminGuilds.length} guilds with admin permissions`);

      // 成功響應
      res.status(200).json({
        success: true,
        data: adminGuilds,
      });
    } catch (error) {
      Logger.error('[UserController] Error fetching guilds:', error.response?.data || error.message);

      // 統一的失敗響應
      res.status(500).json({
        success: false,
        error: '無法獲取伺服器列表，請稍後再試。',
        details: error.response?.data || error.message,
      });
    }
  }
}

module.exports = new UserController();