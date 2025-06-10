const axios = require('axios');
const ReactionRoles = require('../models/ReactionRoles'); // 資料庫模型
const Logger = require('../services/errorhandleService'); // 集中化錯誤處理

class ReactionRoleService {
  constructor() {
    this.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    this.DISCORD_API_BASE = 'https://discord.com/api/v10';

    if (!this.DISCORD_BOT_TOKEN) {
      Logger.error('[ReactionRoleService.constructor] DISCORD_BOT_TOKEN is not set');
      throw new Error('DISCORD_BOT_TOKEN is required');
    }

    Logger.info('[ReactionRoleService.constructor] ReactionRoleService initialized');
  }

  /**
   * 通用 Discord API 請求函式
   */
  async sendDiscordApiRequest(endpoint, method = 'GET', data = null) {
    try {
      Logger.info(`[sendDiscordApiRequest] ${method} ${endpoint}`);
      const response = await axios({
        method,
        url: `${this.DISCORD_API_BASE}${endpoint}`,
        headers: {
          Authorization: `Bot ${this.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error) {
      const status = error.response?.status || 'NO_STATUS';
      const url = `${this.DISCORD_API_BASE}${endpoint}`;
      const errorData = error.response?.data || {};
      const errorCode = errorData.code || 'UNKNOWN';
      const errorMessage = errorData.message || error.message;

      Logger.error(`[Discord API] Request Failed`);
      Logger.error(`→ URL: ${url}`);
      Logger.error(`→ Status: ${status}`);
      Logger.error(`→ Code: ${errorCode}`);
      Logger.error(`→ Message: ${errorMessage}`);

      throw new Error(`Discord API error ${status} (${errorCode}): ${errorMessage}`);
    }
  }

  /**
   * 取得伺服器角色
   */
  async fetchRoles(serverId) {
    if (!serverId) {
      Logger.warn('[fetchRoles] Missing serverId');
      throw new Error('Server ID is required');
    }
    return await this.sendDiscordApiRequest(`/guilds/${serverId}/roles`);
  }

  /**
   * 取得伺服器表情符號
   */
  async fetchEmoji(serverId) {
    if (!serverId) {
      Logger.warn('[fetchEmoji] Missing serverId');
      throw new Error('Server ID is required');
    }
    return await this.sendDiscordApiRequest(`/guilds/${serverId}/emojis`);
  }

  /**
   * 新增一筆反應角色設定
   */
  async addReactionRole(serverId, channelId, messageId, emoji, roleId) {
    if (!serverId || !channelId || !messageId || !emoji || !roleId) {
      Logger.warn('[addReactionRole] Missing parameters');
      throw new Error('All parameters are required');
    }

    Logger.info(`[addReactionRole] Creating reaction role: serverId=${serverId}, messageId=${messageId}, emoji=${emoji}, roleId=${roleId}`);

    const data = {
      server_id: serverId,
      channel_id: channelId,
      message_id: messageId,
      emoji,
      role_id: roleId,
    };

    await ReactionRoles.create(data);
    Logger.info(`[addReactionRole] Created successfully for messageId=${messageId}`);
  }

  /**
   * 查詢伺服器所有反應角色
   */
  async getReactionRolesByServer(serverId) {
    if (!serverId) {
      Logger.warn('[getReactionRolesByServer] Missing serverId');
      throw new Error('Server ID is required');
    }

    Logger.info(`[getReactionRolesByServer] Fetching for serverId=${serverId}`);
    return await ReactionRoles.findByServerId(serverId);
  }

  /**
   * 刪除一筆反應角色設定
   */
  async deleteReactionRole(serverId, messageId, emoji) {
    if (!serverId || !messageId || !emoji) {
      Logger.warn('[deleteReactionRole] Missing parameters');
      throw new Error('Server ID, Message ID, and Emoji are required');
    }

    Logger.info(`[deleteReactionRole] Deleting: serverId=${serverId}, messageId=${messageId}, emoji=${emoji}`);
    const result = await ReactionRoles.deleteByMessageIdAndEmoji(serverId, messageId, emoji);

    if (result.deletedCount === 0) {
      Logger.warn(`[deleteReactionRole] No matching record to delete: messageId=${messageId}`);
    } else {
      Logger.info(`[deleteReactionRole] Deleted ${result.deletedCount} record(s)`);
    }
  }

  /**
   * 更新一筆反應角色設定
   */
  async updateReactionRole(serverId, messageId, channelId, emoji, roleId) {
    if (!serverId || !messageId || !channelId || !emoji || !roleId) {
      Logger.warn('[updateReactionRole] Missing parameters');
      throw new Error('All parameters are required');
    }

    Logger.info(`[updateReactionRole] Updating: serverId=${serverId}, messageId=${messageId}`);
    const data = {
      server_id: serverId,
      channel_id: channelId,
      message_id: messageId,
      emoji,
      role_id: roleId,
    };

    await ReactionRoles.update(data);
    Logger.info(`[updateReactionRole] Updated successfully for messageId=${messageId}`);
  }
}

module.exports = new ReactionRoleService();