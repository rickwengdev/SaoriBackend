const Logs = require('../models/Logs');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class LogService {
  /**
   * 獲取伺服器的日誌頻道 ID
   * @param {string} serverId - 伺服器的 ID
   * @returns {Promise<Object|null>} - 返回日誌頻道記錄或 null
   */
  async getLogChannel(serverId) {
    try {
      Logger.info(`[LogService.getLogChannel] Fetching log channel for serverId=${serverId}`);
      const logChannel = await Logs.findByServerId(serverId);
      if (logChannel) {
        Logger.info(`[LogService.getLogChannel] Log channel found for serverId=${serverId}`);
      } else {
        Logger.warn(`[LogService.getLogChannel] No log channel found for serverId=${serverId}`);
      }
      return logChannel;
    } catch (error) {
      Logger.error(`[LogService.getLogChannel] Error fetching log channel for serverId=${serverId}: ${error.message}`);
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
      Logger.info(`[LogService.setLogChannel] Setting log channel for serverId=${serverId}, logChannelId=${logChannelId}`);
      await Logs.upsert(serverId, logChannelId);
      Logger.info(`[LogService.setLogChannel] Log channel set successfully for serverId=${serverId}`);
      return { success: true };
    } catch (error) {
      Logger.error(`[LogService.setLogChannel] Error setting log channel for serverId=${serverId}: ${error.message}`);
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
      Logger.info(`[LogService.deleteLogChannel] Deleting log channel for serverId=${serverId}`);
      await Logs.deleteByServerId(serverId);
      Logger.info(`[LogService.deleteLogChannel] Log channel deleted successfully for serverId=${serverId}`);
      return { success: true };
    } catch (error) {
      Logger.error(`[LogService.deleteLogChannel] Error deleting log channel for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to delete log channel.');
    }
  }
}

module.exports = new LogService();