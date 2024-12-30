const LogService = require('../services/logService');

class LogsController {
  /**
   * 獲取伺服器的日誌頻道記錄
   * @param {Object} req - 請求對象
   * @param {Object} res - 響應對象
   */
  async getLogChannel(req, res) {
    const { serverId } = req.params;
    try {
      const config = await LogService.getLogChannel(serverId);
      if (!config) {
        return res.status(404).json({ message: 'Log channel not found' });
      }
      res.json({ success: true, config });
    } catch (error) {
      console.error(`Error fetching log channel for serverId ${serverId}:`, error.message);
      res.status(500).json({success: false, message: 'Failed to fetch log channel' });
    }
  }

  /**
   * 設置或更新伺服器的日誌頻道記錄
   * @param {Object} req - 請求對象
   * @param {Object} res - 響應對象
   */
  async setLogChannel(req, res) {
    const { serverId } = req.params;
    const { logChannelId } = req.body;

    if (!logChannelId) {
      return res.status(400).json({ message: 'logChannelId is required' });
    }
    try {
      await LogService.setLogChannel(serverId, logChannelId);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error setting log channel for serverId ${serverId}:`, error.message);
      res.status(500).json({ message: 'Failed to set log channel' });
    }
  }

  /**
   * 刪除伺服器的日誌頻道記錄
   * @param {Object} req - 請求對象
   * @param {Object} res - 響應對象
   */
  async deleteLogChannel(req, res) {
    const { serverId } = req.params;

    try {
      await LogService.deleteLogChannel(serverId);
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting log channel for serverId ${serverId}:`, error.message);
      res.status(500).json({ message: 'Failed to delete log channel' });
    }
  }
}

module.exports = new LogsController();