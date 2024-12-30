const db = require('./db');

class ReactionRoles {
  /**
   * 創建一條 ReactionRole 記錄
   * @param {Object} data { server_id, channel_id, message_id, emoji, role_id }
   */
  static async create(data) {
    const { server_id, channel_id, message_id, emoji, role_id } = data;
    if (!server_id || !channel_id || !message_id || !emoji || !role_id) {
      throw new Error('Invalid parameters: All fields are required');
    }

    const sql = `
      INSERT INTO ReactionRoles (server_id, channel_id, message_id, emoji, role_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    try {
      await db.query(sql, [server_id, channel_id, message_id, emoji, role_id]);
      console.log(`[ReactionRoles.create] Role added for message_id=${message_id}`);
    } catch (error) {
      console.error(`[ReactionRoles.create] Error: ${error.message}`);
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
      throw new Error('Invalid parameter: serverId is required');
    }

    const sql = `SELECT * FROM ReactionRoles WHERE server_id = ?`;
    try {
      const [rows] = await db.query(sql, [serverId]);
      return rows || []; // 確保返回空數組而不是 undefined
    } catch (error) {
      console.error(`[ReactionRoles.findByServerId] Error: ${error.message}`);
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
      throw new Error('Invalid parameters: serverId, messageId, and emoji are required');
    }

    const sql = `DELETE FROM ReactionRoles WHERE server_id = ? AND message_id = ? AND emoji = ?`;
    try {
      await db.query(sql, [serverId, messageId, emoji]);
      console.log(`[ReactionRoles.deleteByMessageIdAndEmoji] Role deleted for server_id=${serverId}, message_id=${messageId}, emoji=${emoji}`);
    } catch (error) {
      console.error(`[ReactionRoles.deleteByMessageIdAndEmoji] Error: ${error.message}`);
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
      throw new Error('Invalid parameters: All fields are required');
    }

    const sql = `
      UPDATE ReactionRoles
      SET channel_id = ?, emoji = ?, role_id = ?
      WHERE server_id = ? AND message_id = ?
    `;
    try {
      await db.query(sql, [channel_id, emoji, role_id, server_id, message_id]);
      console.log(`[ReactionRoles.update] Role updated for message_id=${message_id}`);
    } catch (error) {
      console.error(`[ReactionRoles.update] Error: ${error.message}`);
      throw new Error('Failed to update ReactionRole');
    }
  }
}

module.exports = ReactionRoles;