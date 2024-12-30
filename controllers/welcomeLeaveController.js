const WelcomeLeaveService = require("../services/welcomeLeaveService");

class ServerController {
  /**
   * 獲取伺服器歡迎與離開訊息設定
   * @param {Object} req - 請求物件
   * @param {Object} res - 響應物件
   */
  async getServerConfig(req, res) {
    try {
      const { serverId } = req.params;
      const config = await WelcomeLeaveService.getWelcomeLeave(serverId);
      if (config) {
        res.status(200).json({ success: true, config });
      } else {
        res.status(404).json({ success: false, message: "Configuration not found." });
      }
    } catch (error) {
      console.error("Error fetching server configuration:", error);
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
      console.log(serverId)
      await WelcomeLeaveService.updateConfig(serverId, config);
      res.json({ success: true, message: "Configuration updated successfully." });
    } catch (error) {
      console.error("Error updating server configuration:", error);
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
      await WelcomeLeaveService.deleteConfig(serverId);
      res.json({ success: true, message: "Configuration deleted successfully." });
    } catch (error) {
      console.error("Error deleting server configuration:", error);
      res.status(500).json({ success: false, message: "Failed to delete server configuration." });
    }
  }
}

module.exports = new ServerController();