const db = require('./db');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class TrackingMembers {
  /**
   * 根據伺服器 ID 獲取成員追蹤配置
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<object[]>} 配置數組
   */
  static async findByServerId(serverId) {
    try {
      Logger.info(`[TrackingMembers.findByServerId] Fetching configuration for serverId=${serverId}`);
      const [rows] = await db.query('SELECT trackingmembers_channel_id FROM TrackingMembers WHERE server_id = ?', [serverId]);
      Logger.info(`[TrackingMembers.findByServerId] Found ${rows.length} configurations for serverId=${serverId}`);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      Logger.error(`[TrackingMembers.findByServerId] Error fetching configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to fetch tracking member configuration');
    }
  }

  /**
   * 新增或更新成員追蹤配置
   * @param {string} serverId - 伺服器 ID
   * @param {string} trackingChannelId - 成員追蹤頻道 ID
   */
  static async upsert(serverId, trackingChannelId) {
    if (!serverId || !trackingChannelId) {
      Logger.warn('[TrackingMembers.upsert] Missing required parameters: serverId or trackingChannelId');
      throw new Error('Invalid parameters: serverId and trackingChannelId are required');
    }

    try {
      Logger.info(`[TrackingMembers.upsert] Upserting configuration for serverId=${serverId}, trackingChannelId=${trackingChannelId}`);
      const existingConfig = await this.findByServerId(serverId);

      if (existingConfig) {
        // 更新記錄
        await db.query(
          'UPDATE TrackingMembers SET trackingmembers_channel_id = ? WHERE server_id = ?',
          [trackingChannelId, serverId]
        );
        Logger.info(`[TrackingMembers.upsert] Updated configuration for serverId=${serverId}`);
      } else {
        // 插入新記錄
        await db.query(
          'INSERT INTO TrackingMembers (server_id, trackingmembers_channel_id) VALUES (?, ?)',
          [serverId, trackingChannelId]
        );
        Logger.info(`[TrackingMembers.upsert] Inserted new configuration for serverId=${serverId}`);
      }
    } catch (error) {
      Logger.error(`[TrackingMembers.upsert] Error upserting configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to upsert tracking member configuration');
    }
  }

  /**
   * 刪除伺服器的成員追蹤配置
   * @param {string} serverId - 伺服器 ID
   */
  static async deleteByServerId(serverId) {
    if (!serverId) {
      Logger.warn('[TrackingMembers.deleteByServerId] Missing required parameter: serverId');
      throw new Error('Invalid parameter: serverId is required');
    }

    try {
      Logger.info(`[TrackingMembers.deleteByServerId] Deleting configuration for serverId=${serverId}`);
      await db.query('DELETE FROM TrackingMembers WHERE server_id = ?', [serverId]);
      Logger.info(`[TrackingMembers.deleteByServerId] Successfully deleted configuration for serverId=${serverId}`);
    } catch (error) {
      Logger.error(`[TrackingMembers.deleteByServerId] Error deleting configuration for serverId=${serverId}: ${error.message}`);
      throw new Error('Failed to delete tracking member configuration');
    }
  }
}

module.exports = TrackingMembers;