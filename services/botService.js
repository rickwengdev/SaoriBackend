const axios = require('axios');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class BotService {
  constructor() {
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_BOT_TOKEN) {
      Logger.error('[BotService.constructor] 缺少必要的環境變量：DISCORD_CLIENT_ID 或 DISCORD_BOT_TOKEN');
      throw new Error('缺少必要的環境變量：DISCORD_CLIENT_ID 或 DISCORD_BOT_TOKEN');
    }

    this.DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    this.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    this.discordApiBaseUrl = 'https://discord.com/api/v10';
    this.botUserEndpoint = `${this.discordApiBaseUrl}/users/@me`;
    this.guildMemberEndpoint = (serverId) =>
      `${this.discordApiBaseUrl}/guilds/${serverId}/members/${this.DISCORD_CLIENT_ID}`;

    Logger.info('[BotService.constructor] BotService initialized successfully');
  }

  /**
   * 獲取機器人的頭像 URL
   * @returns {Promise<string>} 機器人頭像的完整 URL
   */
  async getBotAvatarUrl() {
    try {
      Logger.info('[BotService.getBotAvatarUrl] Fetching bot avatar URL');
      const response = await axios.get(this.botUserEndpoint, {
        headers: { Authorization: `Bot ${this.DISCORD_BOT_TOKEN}` },
      });

      const { id, avatar } = response.data;
      if (!avatar) {
        Logger.warn('[BotService.getBotAvatarUrl] Bot avatar not found');
        throw new Error('未找到機器人頭像');
      }

      const avatarUrl = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
      Logger.info(`[BotService.getBotAvatarUrl] Fetched bot avatar URL: ${avatarUrl}`);
      return avatarUrl;
    } catch (error) {
      Logger.error(
        '[BotService.getBotAvatarUrl] Error fetching bot avatar URL:',
        error.response?.data || error.message
      );
      throw new Error('無法獲取機器人頭像');
    }
  }

  /**
   * 檢查機器人是否在指定伺服器中
   * @param {string} serverId 伺服器 ID
   * @returns {Promise<boolean>} 是否存在於伺服器中
   */
  async isBotInServer(serverId) {
    try {
      Logger.info(`[BotService.isBotInServer] Checking bot presence in serverId=${serverId}`);
      await axios.get(this.guildMemberEndpoint(serverId), {
        headers: { Authorization: `Bot ${this.DISCORD_BOT_TOKEN}` },
      });
      Logger.info(`[BotService.isBotInServer] Bot is in serverId=${serverId}`);
      return true; // 如果請求成功，機器人在伺服器中
    } catch (error) {
      if (error.response?.status === 404) {
        Logger.warn(`[BotService.isBotInServer] Bot is not in serverId=${serverId}`);
        return false; // 如果返回 404，機器人不在伺服器中
      }
      Logger.error(
        `[BotService.isBotInServer] Error checking bot presence in serverId=${serverId}:`,
        error.response?.data || error.message
      );
      throw new Error('無法檢查機器人是否在伺服器中');
    }
  }
}

module.exports = new BotService();