const botService = require('../services/botService');
const Logger = require('../services/errorhandleService');

class BotController {
  /**
   * 獲取機器人頭像 URL
   */
  async getBotAvatar(req, res) {
    try {
      const avatarUrl = await botService.getBotAvatarUrl();
      Logger.info(`成功獲取 Bot 頭像: ${avatarUrl}`);

      res.json({ success: true, avatarUrl });
    } catch (error) {
      Logger.error(`獲取 Bot 頭像失敗: ${error.message || error}`);

      res.status(500).json({
        success: false,
        error: '無法獲取 Bot 頭像，請稍後再試',
      });
    }
  }

  /**
   * 檢查機器人是否在特定伺服器中
   */
  async checkBot(req, res) {
    const { serverId } = req.params;

    try {
      const isBotInServer = await botService.isBotInServer(serverId);

      if (isBotInServer) {
        Logger.info(`Bot 存在於伺服器 ${serverId} 中`);
      } else {
        Logger.info(`Bot 不存在於伺服器 ${serverId} 中`);
      }

      res.json({ success: true, isBotInServer });
    } catch (error) {
      Logger.error(`檢查機器人是否在伺服器中失敗: ${error.message || error}`);

      res.status(500).json({
        success: false,
        error: '無法檢查機器人所在伺服器，請稍後再試',
      });
    }
  }
}

module.exports = new BotController();