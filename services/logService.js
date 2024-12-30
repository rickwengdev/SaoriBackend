const Logs = require('../models/Logs');

class LogService {
  /**
   * 獲取伺服器的日誌頻道 ID
   * @param {string} serverId - 伺服器的 ID
   * @returns {Promise<Object|null>} - 返回日誌頻道記錄或 null
   */
  async getLogChannel(serverId) {
    try {
      return await Logs.findByServerId(serverId);
    } catch (error) {
      console.error(`Error fetching log channel for serverId ${serverId}:`, error.message);
      throw new Error('Failed to fetch log channel.');
    }
  }

  /**
   * 設置或更新伺服器的日誌頻道 ID
   * @param {string} serverId - 伺服器的 ID
   * @param {string} logChannelId - 日誌頻道的 ID
   * @returns {Promise<Object>} - 返回操作成功狀態
   */
  async setLogChannel(serverId, logChannelId) {
    try {
      await Logs.upsert(serverId, logChannelId);
      return { success: true };
    } catch (error) {
      console.error(`Error setting log channel for serverId ${serverId}:`, error.message);
      throw new Error('Failed to set log channel.');
    }
  }

  /**
   * 刪除伺服器的日誌頻道記錄
   * @param {string} serverId - 伺服器的 ID
   * @returns {Promise<Object>} - 返回操作成功狀態
   */
  async deleteLogChannel(serverId) {
    try {
      await Logs.deleteByServerId(serverId);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting log channel for serverId ${serverId}:`, error.message);
      throw new Error('Failed to delete log channel.');
    }
  }
}

module.exports = new LogService();