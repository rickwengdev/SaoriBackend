const axios = require('axios');

class BotService {
  constructor() {
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_BOT_TOKEN) {
      throw new Error('缺少必要的環境變量：DISCORD_CLIENT_ID 或 DISCORD_BOT_TOKEN');
    }

    this.DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    this.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    this.discordApiBaseUrl = 'https://discord.com/api/v10';
    this.botUserEndpoint = `${this.discordApiBaseUrl}/users/@me`;
    this.guildMemberEndpoint = (serverId) =>
      `${this.discordApiBaseUrl}/guilds/${serverId}/members/${this.DISCORD_CLIENT_ID}`;
  }

  /**
   * 獲取機器人的頭像 URL
   * @returns {Promise<string>} 機器人頭像的完整 URL
   */
  async getBotAvatarUrl() {
    try {
      const response = await axios.get(this.botUserEndpoint, {
        headers: { Authorization: `Bot ${this.DISCORD_BOT_TOKEN}` },
      });

      const { id, avatar } = response.data;
      if (!avatar) {
        throw new Error('未找到機器人頭像');
      }
      return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
    } catch (error) {
      console.error('Error fetching bot avatar URL:', error.response?.data || error.message);
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
      await axios.get(this.guildMemberEndpoint(serverId), {
        headers: { Authorization: `Bot ${this.DISCORD_BOT_TOKEN}` },
      });
      return true; // 如果請求成功，機器人在伺服器中
    } catch (error) {
      if (error.response?.status === 404) {
        return false; // 如果返回 404，機器人不在伺服器中
      }
      console.error('Error checking bot presence in server:', error.response?.data || error.message);
      throw new Error('無法檢查機器人是否在伺服器中');
    }
  }
}

module.exports = new BotService();