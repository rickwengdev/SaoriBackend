const WelcomeLeaveConfig = require("../models/WelcomeLeave");

class WelcomeLeaveService {
  /**
   * 獲取指定伺服器的歡迎/離開頻道設定
   * @param {string} serverId - 伺服器 ID
   * @returns {Object|null} 返回設定或 null
   */
  async getWelcomeLeave(serverId) {
    return await WelcomeLeaveConfig.findByServerId(serverId);
  }

  /**
   * 更新或創建歡迎/離開頻道設定
   * @param {string} serverId - 伺服器 ID
   * @param {Object} config - 包含 `welcomeChannelId` 和/或 `leaveChannelId`
   * @returns {Object} 操作結果
   */
  async updateConfig(serverId, config) {
    await WelcomeLeaveConfig.upsert(serverId, config); // 使用統一的 upsert 操作
    return { success: true };
  }

  /**
   * 刪除指定伺服器的設定
   * @param {string} serverId - 伺服器 ID
   * @returns {Object} 操作結果
   */
  async deleteConfig(serverId) {
    await WelcomeLeaveConfig.delete(serverId);
    return { success: true };
  }
}

module.exports = new WelcomeLeaveService();