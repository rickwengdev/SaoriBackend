const axios = require('axios');
const ReactionRoles = require('../models/ReactionRoles');
const e = require('express');

class ReactionRoleService {
  constructor() {
    this.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    this.DISCORD_API_BASE = 'https://discord.com/api/v10';
  }

  /**
   * 發送 Discord API 請求並處理錯誤
   * @param {string} endpoint - API 端點
   * @param {string} method - HTTP 方法
   * @param {Object} [data] - 請求數據
   * @returns {Promise<Object>} - 返回的 API 響應數據
   */
  async sendDiscordApiRequest(endpoint, method = 'GET', data = null) {
    try {
      const response = await axios({
        method,
        url: `${this.DISCORD_API_BASE}${endpoint}`,
        headers: { Authorization: `Bot ${this.DISCORD_BOT_TOKEN}` },
        data,
      });
      return response.data;
    } catch (error) {
      console.error(`Error during Discord API request to ${endpoint}:`, error.response?.data || error.message);
      throw new Error('Failed to communicate with Discord API');
    }
  }

  /**
   * 從 Discord 獲取角色列表
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<Array>} - 角色列表
   */
  async fetchRoles(serverId) {
    if (!serverId) throw new Error('Server ID is required');
    return await this.sendDiscordApiRequest(`/guilds/${serverId}/roles`);
  }

  /**
   * 從 Discord 獲取表情符號列表
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<Array>} - 表情符號列表
   */
  async fetchEmoji(serverId) {
    if (!serverId) throw new Error('Server ID is required');
    return await this.sendDiscordApiRequest(`/guilds/${serverId}/emojis`);
  }

  /**
   * 創建新反應角色設置
   * @param {string} serverId - 伺服器 ID
   * @param {string} channelId - 頻道 ID
   * @param {string} messageId - 消息 ID
   * @param {string} emoji - 表情符號
   * @param {string} roleId - 角色 ID
   */
  async addReactionRole(serverId, channelId, messageId, emoji, roleId) {
    if (!serverId || !channelId || !messageId || !emoji || !roleId) {
      throw new Error('All parameters are required to create a reaction role');
    }
    const data = { server_id: serverId, channel_id: channelId, message_id: messageId, emoji, role_id: roleId };
    await ReactionRoles.create(data);
  }

  /**
   * 獲取某個伺服器的所有反應角色設置
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<Array>} - 反應角色設置列表
   */
  async getReactionRolesByServer(serverId) {
    if (!serverId) throw new Error('Server ID is required');
    return await ReactionRoles.findByServerId(serverId);
  }

  /**
   * 刪除某條反應角色設置
   * @param {string} serverId - 伺服器 ID
   * @param {string} messageId - 消息 ID
   * @param {string} id - 唯一 ID
   */
  async deleteReactionRole(serverId, messageId, emoji) {
    if (!serverId || !messageId || !emoji) {
      throw new Error('Server ID and Message ID and id are required to delete a reaction role');
    }
    await ReactionRoles.deleteByMessageIdAndEmoji(serverId, messageId, emoji);
  }

  /**
   * 更新某條反應角色設置
   * @param {string} serverId - 伺服器 ID
   * @param {string} messageId - 消息 ID
   * @param {string} channelId - 頻道 ID
   * @param {string} emoji - 表情符號
   * @param {string} roleId - 角色 ID
   */
  async updateReactionRole(serverId, messageId, channelId, emoji, roleId) {
    if (!serverId || !messageId || !channelId || !emoji || !roleId) {
      throw new Error('All parameters are required to update a reaction role');
    }
    const data = { server_id: serverId, message_id: messageId, channel_id: channelId, emoji, role_id: roleId };
    await ReactionRoles.update(data);
  }
}

module.exports = new ReactionRoleService();