const ServerService = require('../services/serverService');
const Logger = require('../services/errorhandleService');

class ServerController {
  /**
   * 獲取伺服器信息
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   */
  async getServerInfo(req, res) {
    const { serverId } = req.params;

    if (!serverId) {
      Logger.warn('[ServerController] Missing serverId in request params');
      return res.status(400).json({ success: false, message: '缺少伺服器 ID' });
    }

    try {
      Logger.info(`[ServerController] Fetching server info for serverId: ${serverId}`);
      const server = await ServerService.getServerInfo(serverId);
      Logger.info(`[ServerController] Successfully fetched server info for serverId: ${serverId}`);
      res.status(200).json({ success: true, message: '伺服器信息加載成功', data: server });
    } catch (error) {
      Logger.error(`[ServerController] Error fetching server info for serverId: ${serverId}: ${error.message}`);
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
      Logger.warn('[ServerController] Missing serverId or serverName in request body');
      return res.status(400).json({ success: false, message: '缺少伺服器 ID 或名稱' });
    }

    try {
      Logger.info(`[ServerController] Creating server with ID: ${serverId}, Name: ${serverName}`);
      const result = await ServerService.createServer(serverId, serverName);
      Logger.info(`[ServerController] Successfully created server with ID: ${serverId}`);
      res.status(201).json({ success: true, message: result.message });
    } catch (error) {
      Logger.error(`[ServerController] Error creating server with ID: ${serverId}: ${error.message}`);
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
      Logger.warn('[ServerController] Missing serverId or serverName in request body');
      return res.status(400).json({ success: false, message: '缺少伺服器 ID 或名稱' });
    }

    try {
      Logger.info(`[ServerController] Ensuring server exists with ID: ${serverId}`);
      const server = await ServerService.ensureServerExists(serverId, serverName);
      Logger.info(`[ServerController] Server confirmed to exist with ID: ${serverId}`);
      res.status(200).json({ success: true, message: '伺服器已確認存在', data: server });
    } catch (error) {
      Logger.error(`[ServerController] Error ensuring server exists with ID: ${serverId}: ${error.message}`);
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
      Logger.warn('[ServerController] Missing serverId in request params');
      return res.status(400).json({ success: false, message: '缺少伺服器 ID' });
    }

    try {
      Logger.info(`[ServerController] Deleting server with ID: ${serverId}`);
      const result = await ServerService.deleteServer(serverId);
      Logger.info(`[ServerController] Successfully deleted server with ID: ${serverId}`);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      Logger.error(`[ServerController] Error deleting server with ID: ${serverId}: ${error.message}`);
      res.status(500).json({ success: false, message: '無法刪除伺服器' });
    }
  }
}

module.exports = new ServerController();