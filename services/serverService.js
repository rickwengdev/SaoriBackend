const Servers = require('../models/Server');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class ServerService {
  /**
   * 確保伺服器存在，如果不存在則創建
   * @param {string} serverId - 伺服器 ID
   * @param {string} serverName - 伺服器名稱
   * @returns {Promise<Object>} 伺服器信息
   */
  async ensureServerExists(serverId, serverName) {
    try {
      Logger.info(`[ServerService.ensureServerExists] Checking existence of serverId=${serverId}`);
      const server = await Servers.findById(serverId);
      if (!server) {
        await Servers.create(serverId, serverName);
        Logger.info(`[ServerService.ensureServerExists] Server created: ${serverName} (${serverId})`);
        return { server_id: serverId, server_name: serverName };
      }
      Logger.info(`[ServerService.ensureServerExists] Server already exists: ${serverId}`);
      return server;
    } catch (error) {
      Logger.error(`[ServerService.ensureServerExists] Failed to ensure server exists for serverId=${serverId}: ${error.message}`);
      throw new Error('伺服器操作失敗');
    }
  }

  /**
   * 獲取伺服器信息
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<Object>} 伺服器信息
   */
  async getServerInfo(serverId) {
    try {
      Logger.info(`[ServerService.getServerInfo] Fetching info for serverId=${serverId}`);
      const server = await Servers.findById(serverId);
      if (!server) {
        Logger.warn(`[ServerService.getServerInfo] Server not found: ${serverId}`);
        throw new Error(`伺服器 ${serverId} 不存在`);
      }
      Logger.info(`[ServerService.getServerInfo] Server info retrieved for serverId=${serverId}`);
      return server;
    } catch (error) {
      Logger.error(`[ServerService.getServerInfo] Failed to fetch server info for serverId=${serverId}: ${error.message}`);
      throw new Error('伺服器信息加載失敗');
    }
  }

  /**
   * 創建伺服器
   * @param {string} serverId - 伺服器 ID
   * @param {string} serverName - 伺服器名稱
   * @returns {Promise<Object>} 創建結果
   */
  async createServer(serverId, serverName) {
    try {
      Logger.info(`[ServerService.createServer] Creating server: ${serverName} (${serverId})`);
      await Servers.create(serverId, serverName);
      Logger.info(`[ServerService.createServer] Server created successfully: ${serverName} (${serverId})`);
      return { success: true, message: `伺服器 ${serverName} 已創建` };
    } catch (error) {
      Logger.error(`[ServerService.createServer] Failed to create server ${serverName} (${serverId}): ${error.message}`);
      throw new Error('伺服器創建失敗');
    }
  }

  /**
   * 刪除伺服器
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<Object>} 刪除結果
   */
  async deleteServer(serverId) {
    try {
      Logger.info(`[ServerService.deleteServer] Deleting server: ${serverId}`);
      await Servers.delete(serverId);
      Logger.info(`[ServerService.deleteServer] Server deleted successfully: ${serverId}`);
      return { success: true, message: `伺服器 ${serverId} 已刪除` };
    } catch (error) {
      Logger.error(`[ServerService.deleteServer] Failed to delete server ${serverId}: ${error.message}`);
      throw new Error('伺服器刪除失敗');
    }
  }
}

module.exports = new ServerService();