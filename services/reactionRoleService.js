const axios = require('axios');
const ReactionRoles = require('../models/ReactionRoles');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class ReactionRoleService {
  constructor() {
    this.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    this.DISCORD_API_BASE = 'https://discord.com/api/v10';

    if (!this.DISCORD_BOT_TOKEN) {
      Logger.error('[ReactionRoleService.constructor] DISCORD_BOT_TOKEN is not set');
      throw new Error('DISCORD_BOT_TOKEN is required');
    }

    Logger.info('[ReactionRoleService.constructor] ReactionRoleService initialized successfully');
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
      Logger.info(`[ReactionRoleService.sendDiscordApiRequest] Sending ${method} request to ${endpoint}`);
      const response = await axios({
        method,
        url: `${this.DISCORD_API_BASE}${endpoint}`,
        headers: { Authorization: `Bot ${this.DISCORD_BOT_TOKEN}` },
        data,
      });
      Logger.info(`[ReactionRoleService.sendDiscordApiRequest] Request to ${endpoint} successful`);
      return response.data;
    } catch (error) {
      Logger.error(`[ReactionRoleService.sendDiscordApiRequest] Error during Discord API request to ${endpoint}:`, error.response?.data || error.message);
      throw new Error('Failed to communicate with Discord API');
    }
  }

  /**
   * 從 Discord 獲取角色列表
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<Array>} - 角色列表
   */
  async fetchRoles(serverId) {
    if (!serverId) {
      Logger.warn('[ReactionRoleService.fetchRoles] Missing serverId');
      throw new Error('Server ID is required');
    }
    Logger.info(`[ReactionRoleService.fetchRoles] Fetching roles for serverId=${serverId}`);
    return await this.sendDiscordApiRequest(`/guilds/${serverId}/roles`);
  }

  /**
   * 從 Discord 獲取表情符號列表
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<Array>} - 表情符號列表
   */
  async fetchEmoji(serverId) {
    if (!serverId) {
      Logger.warn('[ReactionRoleService.fetchEmoji] Missing serverId');
      throw new Error('Server ID is required');
    }
    Logger.info(`[ReactionRoleService.fetchEmoji] Fetching emojis for serverId=${serverId}`);
    return await this.sendDiscordApiRequest(`/guilds/${serverId}/emojis`);
  }

  /**
   * 創建新反應角色設置
   */
  async addReactionRole(serverId, channelId, messageId, emoji, roleId) {
    if (!serverId || !channelId || !messageId || !emoji || !roleId) {
      Logger.warn('[ReactionRoleService.addReactionRole] Missing required parameters');
      throw new Error('All parameters are required to create a reaction role');
    }
    Logger.info(`[ReactionRoleService.addReactionRole] Adding reaction role for serverId=${serverId}, messageId=${messageId}`);
    const data = { server_id: serverId, channel_id: channelId, message_id: messageId, emoji, role_id: roleId };
    await ReactionRoles.create(data);
    Logger.info(`[ReactionRoleService.addReactionRole] Reaction role added for serverId=${serverId}`);
  }

  /**
   * 獲取某個伺服器的所有反應角色設置
   */
  async getReactionRolesByServer(serverId) {
    if (!serverId) {
      Logger.warn('[ReactionRoleService.getReactionRolesByServer] Missing serverId');
      throw new Error('Server ID is required');
    }
    Logger.info(`[ReactionRoleService.getReactionRolesByServer] Fetching reaction roles for serverId=${serverId}`);
    return await ReactionRoles.findByServerId(serverId);
  }

  /**
   * 刪除某條反應角色設置
   */
  async deleteReactionRole(serverId, messageId, emoji) {
    if (!serverId || !messageId || !emoji) {
      Logger.warn('[ReactionRoleService.deleteReactionRole] Missing required parameters');
      throw new Error('Server ID, Message ID, and Emoji are required to delete a reaction role');
    }
    Logger.info(`[ReactionRoleService.deleteReactionRole] Deleting reaction role for serverId=${serverId}, messageId=${messageId}`);
    await ReactionRoles.deleteByMessageIdAndEmoji(serverId, messageId, emoji);
    Logger.info(`[ReactionRoleService.deleteReactionRole] Reaction role deleted for serverId=${serverId}`);
  }

  /**
   * 更新某條反應角色設置
   */
  async updateReactionRole(serverId, messageId, channelId, emoji, roleId) {
    if (!serverId || !messageId || !channelId || !emoji || !roleId) {
      Logger.warn('[ReactionRoleService.updateReactionRole] Missing required parameters');
      throw new Error('All parameters are required to update a reaction role');
    }
    Logger.info(`[ReactionRoleService.updateReactionRole] Updating reaction role for serverId=${serverId}, messageId=${messageId}`);
    const data = { server_id: serverId, message_id: messageId, channel_id: channelId, emoji, role_id: roleId };
    await ReactionRoles.update(data);
    Logger.info(`[ReactionRoleService.updateReactionRole] Reaction role updated for serverId=${serverId}`);
  }
}

module.exports = new ReactionRoleService();