const channelService = require('../services/channelService');
const Logger = require('../services/errorhandleService'); // 引入 Logger

class ChannelController {
  /**
   * 獲取伺服器的頻道列表
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  async getGuildChannels(req, res) {
    const { serverId } = req.params; // 從 URL 中獲取伺服器 ID

    try {
      Logger.info(`Fetching channels for server ID: ${serverId}`);
      
      // 調用服務層以獲取頻道列表
      const channels = await channelService.getGuildChannels(serverId);

      Logger.info(`Successfully fetched channels for server ID: ${serverId}`);

      // 成功響應
      res.status(200).json({
        success: true,
        channels,
      });
    } catch (error) {
      Logger.error(`Error fetching channels for server ID ${serverId}: ${error.message}`);

      // 失敗響應
      res.status(500).json({
        success: false,
        message: '獲取伺服器頻道列表失敗，請稍後再試。',
        error: error.message, // 提供更詳細的錯誤信息
      });
    }
  }
}

module.exports = new ChannelController();