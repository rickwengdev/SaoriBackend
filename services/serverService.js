const Servers = require('../models/Server');

class ServerService {
  /**
   * 確保伺服器存在，如果不存在則創建
   * @param {string} serverId - 伺服器 ID
   * @param {string} serverName - 伺服器名稱
   * @returns {Promise<Object>} 伺服器信息
   */
  async ensureServerExists(serverId, serverName) {
    try {
      const server = await Servers.findById(serverId);
      if (!server) {
        await Servers.create(serverId, serverName);
        console.log(`伺服器已添加: ${serverName} (${serverId})`);
        return { server_id: serverId, server_name: serverName };
      }
      return server;
    } catch (error) {
      console.error(`無法確保伺服器存在: ${error.message}`);
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
      const server = await Servers.findById(serverId);
      if (!server) throw new Error(`伺服器 ${serverId} 不存在`);
      return server;
    } catch (error) {
      console.error(`無法獲取伺服器信息: ${error.message}`);
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
      await Servers.create(serverId, serverName);
      return { success: true, message: `伺服器 ${serverName} 已創建` };
    } catch (error) {
      console.error(`無法創建伺服器: ${error.message}`);
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
      await Servers.delete(serverId);
      return { success: true, message: `伺服器 ${serverId} 已刪除` };
    } catch (error) {
      console.error(`無法刪除伺服器: ${error.message}`);
      throw new Error('伺服器刪除失敗');
    }
  }
}

module.exports = new ServerService();