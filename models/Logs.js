const db = require('./db');

const Logs = {
  /**
   * 查找特定伺服器的日誌頻道
   * @param {string} serverId - 伺服器的 ID
   * @returns {Promise<Object|null>} 返回日誌記錄或 null
   */
  async findByServerId(serverId) {
    const [rows] = await db.query(
      'SELECT log_channel_id FROM Logs WHERE server_id = ?',
      [serverId]
    );
    return rows.length ? rows[0] : null; // 返回第一條匹配的記錄或 null
  },

  /**
   * 插入或更新日誌頻道記錄
   * @param {string} serverId - 伺服器的 ID
   * @param {string} logChannelId - 日誌頻道的 ID
   * @returns {Promise<void>}
   */ 
  async upsert(serverId, logChannelId) {
    try {
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
      } else {
        // 插入新記錄
        await db.query(
          'INSERT INTO Logs (server_id, log_channel_id) VALUES (?, ?)',
          [serverId, logChannelId]
        );
      }
    } catch (error) {
      console.error(`Error upserting log channel for serverId ${serverId}:`, error.message);
      throw error;
    }
  },

  /**
   * 刪除特定伺服器的日誌頻道記錄
   * @param {string} serverId - 伺服器的 ID
   * @returns {Promise<void>}
   */
  async deleteByServerId(serverId) {
    await db.query('DELETE FROM Logs WHERE server_id = ?', [serverId]);
  },
};

module.exports = Logs;