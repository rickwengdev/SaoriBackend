const ServerService = require('../services/serverService');

class ServerController {
  /**
   * 獲取伺服器信息
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  async getServerInfo(req, res) {
    const { serverId } = req.params;

    if (!serverId) {
      return res.status(400).json({ success: false, message: '缺少伺服器 ID' });
    }

    try {
      const server = await ServerService.getServerInfo(serverId);
      res.status(200).json({ success: true, message: '伺服器信息加載成功', data: server });
    } catch (error) {
      console.error('Error fetching server info:', error.message);
      res.status(404).json({ success: false, message: error.message });
    }
  }

  /**
   * 創建伺服器
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  async createServer(req, res) {
    const { serverId, serverName } = req.body;

    if (!serverId || !serverName) {
      return res.status(400).json({ success: false, message: '缺少伺服器 ID 或名稱' });
    }

    try {
      const result = await ServerService.createServer(serverId, serverName);
      res.status(201).json({ success: true, message: result.message });
    } catch (error) {
      console.error('Error creating server:', error.message);
      res.status(500).json({ success: false, message: '無法創建伺服器' });
    }
  }

  /**
   * 確保伺服器存在
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  async ensureServerExists(req, res) {
    const { serverId, serverName } = req.body;

    if (!serverId || !serverName) {
      return res.status(400).json({ success: false, message: '缺少伺服器 ID 或名稱' });
    }

    try {
      const server = await ServerService.ensureServerExists(serverId, serverName);
      res.status(200).json({ success: true, message: '伺服器已確認存在', data: server });
    } catch (error) {
      console.error('Error ensuring server exists:', error.message);
      res.status(500).json({ success: false, message: '無法確保伺服器信息存在' });
    }
  }

  /**
   * 刪除伺服器
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  async deleteServer(req, res) {
    const { serverId } = req.params;

    if (!serverId) {
      return res.status(400).json({ success: false, message: '缺少伺服器 ID' });
    }

    try {
      const result = await ServerService.deleteServer(serverId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      console.error('Error deleting server:', error.message);
      res.status(500).json({ success: false, message: '無法刪除伺服器' });
    }
  }
}

module.exports = new ServerController();