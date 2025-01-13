const axios = require('axios');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class ChannelService {
  constructor() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      Logger.error('[ChannelService.constructor] 環境變量 DISCORD_BOT_TOKEN 未設置');
      throw new Error('環境變量 DISCORD_BOT_TOKEN 未設置');
    }
    this.botToken = process.env.DISCORD_BOT_TOKEN; // 環境變量中的 Bot Token
    this.discordApiBaseUrl = 'https://discord.com/api/v10'; // Discord API 基本 URL

    Logger.info('[ChannelService.constructor] ChannelService initialized successfully');
  }

  /**
   * 獲取指定伺服器的頻道列表
   * @param {string} guildId - Discord 伺服器 ID
   * @returns {Promise<Array>} - 包含頻道信息的數組
   * @throws {Error} - 無法獲取頻道列表時拋出錯誤
   */
  async getGuildChannels(guildId) {
    try {
      Logger.info(`[ChannelService.getGuildChannels] Fetching channels for guildId=${guildId}`);
      const response = await axios.get(`${this.discordApiBaseUrl}/guilds/${guildId}/channels`, {
        headers: {
          Authorization: `Bot ${this.botToken}`, // 使用 Bot Token 進行授權
        },
      });
      Logger.info(`[ChannelService.getGuildChannels] Successfully fetched channels for guildId=${guildId}`);
      return response.data; // 返回頻道列表數據
    } catch (error) {
      Logger.error(`[ChannelService.getGuildChannels] Error fetching channels for guildId=${guildId}:`, error.response?.data || error.message);
      throw new Error('無法獲取頻道列表，請檢查伺服器 ID 或 Discord API 是否正常運行');
    }
  }
}

module.exports = new ChannelService();