const WelcomeLeaveConfig = require("../models/WelcomeLeave");
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class WelcomeLeaveService {
  /**
   * 獲取指定伺服器的歡迎/離開頻道設定
   * @param {string} serverId - 伺服器 ID
   * @returns {Object|null} 返回設定或 null
   */
  async getWelcomeLeave(serverId) {
    try {
      Logger.info(`[WelcomeLeaveService.getWelcomeLeave] Fetching configuration for serverId=${serverId}`);
      const config = await WelcomeLeaveConfig.findByServerId(serverId);
      if (config) {
        Logger.info(`[WelcomeLeaveService.getWelcomeLeave] Configuration found for serverId=${serverId}`);
      } else {
        Logger.warn(`[WelcomeLeaveService.getWelcomeLeave] No configuration found for serverId=${serverId}`);
      }
      return config;
    } catch (error) {
      Logger.error(`[WelcomeLeaveService.getWelcomeLeave] Error fetching configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to fetch welcome/leave configuration.');
    }
  }

  /**
   * 更新或創建歡迎/離開頻道設定
   * @param {string} serverId - 伺服器 ID
   * @param {Object} config - 包含 `welcomeChannelId` 和/或 `leaveChannelId`
   * @returns {Object} 操作結果
   */
  async updateConfig(serverId, config) {
    try {
      Logger.info(`[WelcomeLeaveService.updateConfig] Updating configuration for serverId=${serverId} with data=${JSON.stringify(config)}`);
      await WelcomeLeaveConfig.upsert(serverId, config); // 使用統一的 upsert 操作
      Logger.info(`[WelcomeLeaveService.updateConfig] Configuration updated successfully for serverId=${serverId}`);
      return { success: true };
    } catch (error) {
      Logger.error(`[WelcomeLeaveService.updateConfig] Error updating configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to update welcome/leave configuration.');
    }
  }

  /**
   * 刪除指定伺服器的設定
   * @param {string} serverId - 伺服器 ID
   * @returns {Object} 操作結果
   */
  async deleteConfig(serverId) {
    try {
      Logger.info(`[WelcomeLeaveService.deleteConfig] Deleting configuration for serverId=${serverId}`);
      await WelcomeLeaveConfig.delete(serverId);
      Logger.info(`[WelcomeLeaveService.deleteConfig] Configuration deleted successfully for serverId=${serverId}`);
      return { success: true };
    } catch (error) {
      Logger.error(`[WelcomeLeaveService.deleteConfig] Error deleting configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to delete welcome/leave configuration.');
    }
  }
}

module.exports = new WelcomeLeaveService();