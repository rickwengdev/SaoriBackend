const db = require('./db');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class DynamicVoiceChannels {
  /**
   * 根據伺服器 ID 獲取動態語音頻道配置
   * @param {string} serverId
   * @returns {Promise<object[]>} 配置數組
   */
  static async findByServerId(serverId) {
    try {
      Logger.info(`[DynamicVoiceChannels.findByServerId] Fetching configuration for serverId=${serverId}`);
      const [rows] = await db.query('SELECT base_channel_id FROM DynamicVoiceChannels WHERE server_id = ?', [serverId]);
      Logger.info(`[DynamicVoiceChannels.findByServerId] Found ${rows.length} configurations for serverId=${serverId}`);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      Logger.error(`[DynamicVoiceChannels.findByServerId] Error fetching configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to fetch dynamic voice channels');
    }
  }

  /**
   * 新增或更新動態語音頻道配置
   * @param {string} serverId 伺服器 ID
   * @param {string} baseChannelId 基本語音頻道 ID
   */
  static async upsert(serverId, baseChannelId) {
    if (!serverId || !baseChannelId) {
      Logger.warn('[DynamicVoiceChannels.upsert] Missing required parameters: serverId or baseChannelId');
      throw new Error('Invalid parameters: serverId and baseChannelId are required');
    }

    try {
      Logger.info(`[DynamicVoiceChannels.upsert] Upserting configuration for serverId=${serverId}, baseChannelId=${baseChannelId}`);
      const existingConfig = await this.findByServerId(serverId);

      if (existingConfig) {
        // 更新記錄
        await db.query(
          'UPDATE DynamicVoiceChannels SET base_channel_id = ? WHERE server_id = ?',
          [baseChannelId, serverId]
        );
        Logger.info(`[DynamicVoiceChannels.upsert] Updated configuration for serverId=${serverId}`);
      } else {
        // 插入新記錄
        await db.query(
          'INSERT INTO DynamicVoiceChannels (server_id, base_channel_id) VALUES (?, ?)',
          [serverId, baseChannelId]
        );
        Logger.info(`[DynamicVoiceChannels.upsert] Inserted new configuration for serverId=${serverId}`);
      }
    } catch (error) {
      Logger.error(`[DynamicVoiceChannels.upsert] Error upserting configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to upsert dynamic voice channel configuration');
    }
  }

  /**
   * 刪除伺服器的動態語音頻道配置
   * @param {string} serverId 伺服器 ID
   */
  static async deleteByServerId(serverId) {
    if (!serverId) {
      Logger.warn('[DynamicVoiceChannels.deleteByServerId] Missing required parameter: serverId');
      throw new Error('Invalid parameter: serverId is required');
    }

    try {
      Logger.info(`[DynamicVoiceChannels.deleteByServerId] Deleting configuration for serverId=${serverId}`);
      await db.query('DELETE FROM DynamicVoiceChannels WHERE server_id = ?', [serverId]);
      Logger.info(`[DynamicVoiceChannels.deleteByServerId] Successfully deleted configuration for serverId=${serverId}`);
    } catch (error) {
      Logger.error(`[DynamicVoiceChannels.deleteByServerId] Error deleting configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to delete dynamic voice channel configuration');
    }
  }
}

module.exports = DynamicVoiceChannels;