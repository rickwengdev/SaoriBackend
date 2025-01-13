const db = require('./db');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

const Logs = {
  /**
   * 查找特定伺服器的日誌頻道
   * @param {string} serverId - 伺服器的 ID
   * @returns {Promise<Object|null>} 返回日誌記錄或 null
   */
  async findByServerId(serverId) {
    try {
      Logger.info(`[Logs.findByServerId] Fetching log channel for serverId=${serverId}`);
      const [rows] = await db.query(
        'SELECT log_channel_id FROM Logs WHERE server_id = ?',
        [serverId]
      );
      Logger.info(`[Logs.findByServerId] Found ${rows.length} log channel(s) for serverId=${serverId}`);
      return rows.length ? rows[0] : null;
    } catch (error) {
      Logger.error(`[Logs.findByServerId] Error fetching log channel for serverId=${serverId}: ${error.message}`);
      throw error;
    }
  },

  /**
   * 插入或更新日誌頻道記錄
   * @param {string} serverId - 伺服器的 ID
   * @param {string} logChannelId - 日誌頻道的 ID
   * @returns {Promise<void>}
   */
  async upsert(serverId, logChannelId) {
    try {
      Logger.info(`[Logs.upsert] Upserting log channel for serverId=${serverId}, logChannelId=${logChannelId}`);
      
      // 確保 serverId 是純字符串或數字
      if (typeof serverId === 'object' && serverId.serverId) {
        serverId = serverId.serverId;
      }
      
      // 檢查是否已存在記錄
      const existingConfig = await this.findByServerId(serverId);

      if (existingConfig) {
        // 更新記錄
        await db.query(
          'UPDATE Logs SET log_channel_id = ? WHERE server_id = ?',
          [logChannelId, serverId]
        );
        Logger.info(`[Logs.upsert] Updated log channel for serverId=${serverId}`);
      } else {
        // 插入新記錄
        await db.query(
          'INSERT INTO Logs (server_id, log_channel_id) VALUES (?, ?)',
          [serverId, logChannelId]
        );
        Logger.info(`[Logs.upsert] Inserted new log channel for serverId=${serverId}`);
      }
    } catch (error) {
      Logger.error(`[Logs.upsert] Error upserting log channel for serverId=${serverId}: ${error.message}`);
      throw error;
    }
  },

  /**
   * 刪除特定伺服器的日誌頻道記錄
   * @param {string} serverId - 伺服器的 ID
   * @returns {Promise<void>}
   */
  async deleteByServerId(serverId) {
    try {
      Logger.info(`[Logs.deleteByServerId] Deleting log channel for serverId=${serverId}`);
      await db.query('DELETE FROM Logs WHERE server_id = ?', [serverId]);
      Logger.info(`[Logs.deleteByServerId] Successfully deleted log channel for serverId=${serverId}`);
    } catch (error) {
      Logger.error(`[Logs.deleteByServerId] Error deleting log channel for serverId=${serverId}: ${error.message}`);
      throw error;
    }
  },
};

module.exports = Logs;