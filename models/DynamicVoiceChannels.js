const db = require('./db');

class DynamicVoiceChannels {
  /**
   * 根據伺服器 ID 獲取動態語音頻道配置
   * @param {string} serverId
   * @returns {Promise<object[]>} 配置數組
   */
  static async findByServerId(serverId) {
    try {
      const [rows] = await db.query('SELECT base_channel_id FROM DynamicVoiceChannels WHERE server_id = ?', [serverId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error(`[DynamicVoiceChannels.findByServerId] Error: ${error.message}`);
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
      throw new Error('Invalid parameters: serverId and baseChannelId are required');
    }

    try {
      // 查找是否已存在配置
      const existingConfig = await this.findByServerId(serverId);

      if (existingConfig) {
        // 更新記錄
        await db.query(
          'UPDATE DynamicVoiceChannels SET base_channel_id = ? WHERE server_id = ?',
          [baseChannelId, serverId]
        );
      } else {
        // 插入新記錄
        await db.query(
          'INSERT INTO DynamicVoiceChannels (server_id, base_channel_id) VALUES (?, ?)',
          [serverId, baseChannelId]
        );
      }
    } catch (error) {
      console.error(`[DynamicVoiceChannels.upsert] Error: ${error.message}`);
      throw new Error('Failed to upsert dynamic voice channel configuration');
    }
  }

  /**
   * 刪除伺服器的動態語音頻道配置
   * @param {string} serverId 伺服器 ID
   */
  static async deleteByServerId(serverId) {
    if (!serverId) {
      throw new Error('Invalid parameter: serverId is required');
    }

    try {
      await db.query('DELETE FROM DynamicVoiceChannels WHERE server_id = ?', [serverId]);
      console.log(`[DynamicVoiceChannels.deleteByServerId] Deleted configuration for serverId=${serverId}`);
    } catch (error) {
      console.error(`[DynamicVoiceChannels.deleteByServerId] Error: ${error.message}`);
      throw new Error('Failed to delete dynamic voice channel configuration');
    }
  }
}

module.exports = DynamicVoiceChannels;