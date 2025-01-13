const WelcomeLeaveService = require("../services/welcomeLeaveService");
const Logger = require('../services/errorhandleService');

class ServerController {
  /**
   * 獲取伺服器歡迎與離開訊息設定
   * @param {Object} req - 請求物件
   * @param {Object} res - 響應物件
   */
  async getServerConfig(req, res) {
    try {
      const { serverId } = req.params;
      Logger.info(`[ServerController] Fetching welcome/leave configuration for serverId: ${serverId}`);
      const config = await WelcomeLeaveService.getWelcomeLeave(serverId);
      if (config) {
        Logger.info(`[ServerController] Successfully fetched configuration for serverId: ${serverId}`);
        res.status(200).json({ success: true, config });
      } else {
        Logger.warn(`[ServerController] No configuration found for serverId: ${serverId}`);
        res.status(404).json({ success: false, message: "Configuration not found." });
      }
    } catch (error) {
      Logger.error(`[ServerController] Error fetching configuration for serverId: ${serverId}: ${error.message}`);
      res.status(500).json({ success: false, message: "Failed to fetch server configuration." });
    }
  }

  /**
   * 更新伺服器歡迎與離開訊息設定
   * @param {Object} req - 請求物件
   * @param {Object} res - 響應物件
   */
  async updateConfig(req, res) {
    try {
      const { serverId } = req.params;
      const config = req.body;
      Logger.info(`[ServerController] Updating welcome/leave configuration for serverId: ${serverId}`);
      await WelcomeLeaveService.updateConfig(serverId, config);
      Logger.info(`[ServerController] Successfully updated configuration for serverId: ${serverId}`);
      res.json({ success: true, message: "Configuration updated successfully." });
    } catch (error) {
      Logger.error(`[ServerController] Error updating configuration for serverId: ${serverId}: ${error.message}`);
      res.status(500).json({ success: false, message: "Failed to update server configuration." });
    }
  }

  /**
   * 刪除伺服器歡迎與離開訊息設定
   * @param {Object} req - 請求物件
   * @param {Object} res - 響應物件
   */
  async deleteConfig(req, res) {
    try {
      const { serverId } = req.params;
      Logger.info(`[ServerController] Deleting welcome/leave configuration for serverId: ${serverId}`);
      await WelcomeLeaveService.deleteConfig(serverId);
      Logger.info(`[ServerController] Successfully deleted configuration for serverId: ${serverId}`);
      res.json({ success: true, message: "Configuration deleted successfully." });
    } catch (error) {
      Logger.error(`[ServerController] Error deleting configuration for serverId: ${serverId}: ${error.message}`);
      res.status(500).json({ success: false, message: "Failed to delete server configuration." });
    }
  }
}

module.exports = new ServerController();