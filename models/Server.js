const db = require('./db');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

const Servers = {
  /**
   * 查詢伺服器資料
   * @param {string} serverId 伺服器 ID
   * @returns {Promise<Object>} 伺服器資料
   */
  async findById(serverId) {
    try {
      Logger.info(`[Servers.findById] Fetching server data for serverId=${serverId}`);
      const [rows] = await db.query('SELECT * FROM Servers WHERE server_id = ?', [serverId]);
      if (rows.length > 0) {
        Logger.info(`[Servers.findById] Found server data for serverId=${serverId}`);
      } else {
        Logger.warn(`[Servers.findById] No server data found for serverId=${serverId}`);
      }
      return rows[0] || null;
    } catch (error) {
      Logger.error(`[Servers.findById] Error fetching server data for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to fetch server data');
    }
  },

  /**
   * 創建伺服器資料
   * @param {Object} data 伺服器資料
   * @param {string} serverId 伺服器 ID
   * @param {string} serverName 伺服器名稱
   */
  async create(serverId, serverName) {
    const sql = `
      INSERT INTO Servers (server_id, server_name)
      VALUES (?, ?)
    `;
    try {
      Logger.info(`[Servers.create] Creating server data for serverId=${serverId}, serverName=${serverName}`);
      await db.query(sql, [serverId, serverName]);
      Logger.info(`[Servers.create] Successfully created server data for serverId=${serverId}`);
    } catch (error) {
      Logger.error(`[Servers.create] Error creating server data for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to create server data');
    }
  },
};

module.exports = Servers;