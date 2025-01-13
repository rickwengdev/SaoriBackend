const db = require('./db');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class ReactionRoles {
  /**
   * 創建一條 ReactionRole 記錄
   * @param {Object} data { server_id, channel_id, message_id, emoji, role_id }
   */
  static async create(data) {
    const { server_id, channel_id, message_id, emoji, role_id } = data;
    if (!server_id || !channel_id || !message_id || !emoji || !role_id) {
      Logger.warn('[ReactionRoles.create] Missing required parameters');
      throw new Error('Invalid parameters: All fields are required');
    }

    const sql = `
      INSERT INTO ReactionRoles (server_id, channel_id, message_id, emoji, role_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    try {
      await db.query(sql, [server_id, channel_id, message_id, emoji, role_id]);
      Logger.info(`[ReactionRoles.create] Role added for message_id=${message_id}`);
    } catch (error) {
      Logger.error(`[ReactionRoles.create] Error: ${error.message}`);
      throw new Error('Failed to create ReactionRole');
    }
  }

  /**
   * 根據伺服器 ID 獲取所有 ReactionRoles
   * @param {string} serverId
   * @returns {Promise<Object[]>} ReactionRole 列表
   */
  static async findByServerId(serverId) {
    if (!serverId) {
      Logger.warn('[ReactionRoles.findByServerId] Missing serverId');
      throw new Error('Invalid parameter: serverId is required');
    }

    const sql = `SELECT * FROM ReactionRoles WHERE server_id = ?`;
    try {
      Logger.info(`[ReactionRoles.findByServerId] Fetching ReactionRoles for serverId=${serverId}`);
      const [rows] = await db.query(sql, [serverId]);
      Logger.info(`[ReactionRoles.findByServerId] Found ${rows.length} ReactionRoles for serverId=${serverId}`);
      return rows || []; // 確保返回空數組而不是 undefined
    } catch (error) {
      Logger.error(`[ReactionRoles.findByServerId] Error: ${error.message}`);
      throw new Error('Failed to fetch ReactionRoles');
    }
  }

  /**
   * 根據伺服器 ID、消息 ID 和 Emoji 刪除 ReactionRole
   * @param {string} serverId
   * @param {string} messageId
   * @param {string} emoji
   */
  static async deleteByMessageIdAndEmoji(serverId, messageId, emoji) {
    if (!serverId || !messageId || !emoji) {
      Logger.warn('[ReactionRoles.deleteByMessageIdAndEmoji] Missing required parameters');
      throw new Error('Invalid parameters: serverId, messageId, and emoji are required');
    }

    const sql = `DELETE FROM ReactionRoles WHERE server_id = ? AND message_id = ? AND emoji = ?`;
    try {
      Logger.info(`[ReactionRoles.deleteByMessageIdAndEmoji] Deleting ReactionRole for serverId=${serverId}, messageId=${messageId}, emoji=${emoji}`);
      await db.query(sql, [serverId, messageId, emoji]);
      Logger.info(`[ReactionRoles.deleteByMessageIdAndEmoji] Role deleted for serverId=${serverId}, messageId=${messageId}, emoji=${emoji}`);
    } catch (error) {
      Logger.error(`[ReactionRoles.deleteByMessageIdAndEmoji] Error: ${error.message}`);
      throw new Error('Failed to delete ReactionRole');
    }
  }

  /**
   * 更新 ReactionRole 記錄
   * @param {Object} data { server_id, channel_id, message_id, emoji, role_id }
   */
  static async update(data) {
    const { server_id, channel_id, message_id, emoji, role_id } = data;
    if (!server_id || !channel_id || !message_id || !emoji || !role_id) {
      Logger.warn('[ReactionRoles.update] Missing required parameters');
      throw new Error('Invalid parameters: All fields are required');
    }

    const sql = `
      UPDATE ReactionRoles
      SET channel_id = ?, emoji = ?, role_id = ?
      WHERE server_id = ? AND message_id = ?
    `;
    try {
      Logger.info(`[ReactionRoles.update] Updating ReactionRole for serverId=${server_id}, messageId=${message_id}`);
      await db.query(sql, [channel_id, emoji, role_id, server_id, message_id]);
      Logger.info(`[ReactionRoles.update] Role updated for serverId=${server_id}, messageId=${message_id}`);
    } catch (error) {
      Logger.error(`[ReactionRoles.update] Error: ${error.message}`);
      throw new Error('Failed to update ReactionRole');
    }
  }
}

module.exports = ReactionRoles;