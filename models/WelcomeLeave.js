const db = require('./db');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

const WelcomeLeaveConfig = {
  /**
   * 查找指定伺服器的歡迎/離開訊息設定
   * @param {string} serverId
   * @returns {Object|null} 記錄或 null
   */
  async findByServerId(serverId) {
    try {
      Logger.info(`[WelcomeLeaveConfig.findByServerId] Fetching configuration for serverId=${serverId}`);
      const [rows] = await db.query(
        'SELECT * FROM WelcomeLeaveConfig WHERE server_id = ?',
        [serverId]
      );
      if (rows.length > 0) {
        Logger.info(`[WelcomeLeaveConfig.findByServerId] Configuration found for serverId=${serverId}`);
        return rows[0];
      } else {
        Logger.warn(`[WelcomeLeaveConfig.findByServerId] No configuration found for serverId=${serverId}`);
        return null;
      }
    } catch (error) {
      Logger.error(`[WelcomeLeaveConfig.findByServerId] Error fetching configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to fetch configuration');
    }
  },

  /**
   * 插入或更新歡迎和離開頻道設定
   * @param {string} serverId
   * @param {Object} config 包含 `welcomeChannelId` 和/或 `leaveChannelId`
   * @returns {void}
   */
  async upsert(serverId, config) {
    const { welcomeChannelId, leaveChannelId } = config;

    try {
      Logger.info(`[WelcomeLeaveConfig.upsert] Upserting configuration for serverId=${serverId}`);
      const existingConfig = await this.findByServerId(serverId);

      if (existingConfig) {
        const updateFields = [];
        const updateValues = [];

        if (welcomeChannelId !== undefined) {
          updateFields.push('welcome_channel_id = ?');
          updateValues.push(welcomeChannelId);
        }
        if (leaveChannelId !== undefined) {
          updateFields.push('leave_channel_id = ?');
          updateValues.push(leaveChannelId);
        }

        if (updateFields.length > 0) {
          await db.query(
            `UPDATE WelcomeLeaveConfig SET ${updateFields.join(', ')} WHERE server_id = ?`,
            [...updateValues, serverId]
          );
          Logger.info(`[WelcomeLeaveConfig.upsert] Configuration updated for serverId=${serverId}`);
        }
      } else {
        await db.query(
          'INSERT INTO WelcomeLeaveConfig (server_id, welcome_channel_id, leave_channel_id) VALUES (?, ?, ?)',
          [serverId, welcomeChannelId || null, leaveChannelId || null]
        );
        Logger.info(`[WelcomeLeaveConfig.upsert] Configuration inserted for serverId=${serverId}`);
      }
    } catch (error) {
      Logger.error(`[WelcomeLeaveConfig.upsert] Error upserting configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to upsert configuration');
    }
  },

  /**
   * 刪除指定伺服器的設定
   * @param {string} serverId
   * @returns {void}
   */
  async delete(serverId) {
    try {
      Logger.info(`[WelcomeLeaveConfig.delete] Deleting configuration for serverId=${serverId}`);
      await db.query('DELETE FROM WelcomeLeaveConfig WHERE server_id = ?', [serverId]);
      Logger.info(`[WelcomeLeaveConfig.delete] Configuration deleted for serverId=${serverId}`);
    } catch (error) {
      Logger.error(`[WelcomeLeaveConfig.delete] Error deleting configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to delete configuration');
    }
  },
};

module.exports = WelcomeLeaveConfig;