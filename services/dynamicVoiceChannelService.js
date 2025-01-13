const DynamicVoiceChannels = require('../models/DynamicVoiceChannels');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class DynamicVoiceChannelService {
  /**
   * 獲取伺服器的動態語音頻道配置
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<object[]>} 動態語音頻道配置
   */
  async getDynamicVoiceChannels(serverId) {
    try {
      if (!serverId) {
        Logger.warn('[DynamicVoiceChannelService.getDynamicVoiceChannels] Missing serverId');
        throw new Error('Server ID is required to fetch dynamic voice channels');
      }
      Logger.info(`[DynamicVoiceChannelService.getDynamicVoiceChannels] Fetching configuration for serverId=${serverId}`);
      const config = await DynamicVoiceChannels.findByServerId(serverId);
      Logger.info(`[DynamicVoiceChannelService.getDynamicVoiceChannels] Fetched configuration for serverId=${serverId}`);
      return config;
    } catch (error) {
      Logger.error(`[DynamicVoiceChannelService.getDynamicVoiceChannels] Error fetching configuration for serverId=${serverId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 新增或更新動態語音頻道配置
   * @param {string} serverId - 伺服器 ID
   * @param {string} baseChannelId - 基礎語音頻道 ID
   * @returns {Promise<{ success: boolean }>}
   */
  async upsertDynamicVoiceChannel(serverId, baseChannelId) {
    try {
      if (!serverId || !baseChannelId) {
        Logger.warn('[DynamicVoiceChannelService.upsertDynamicVoiceChannel] Missing serverId or baseChannelId');
        throw new Error('Server ID and Base Channel ID are required');
      }
      Logger.info(`[DynamicVoiceChannelService.upsertDynamicVoiceChannel] Upserting configuration for serverId=${serverId}, baseChannelId=${baseChannelId}`);
      await DynamicVoiceChannels.upsert(serverId, baseChannelId);
      Logger.info(`[DynamicVoiceChannelService.upsertDynamicVoiceChannel] Upserted configuration for serverId=${serverId}`);
      return { success: true };
    } catch (error) {
      Logger.error(`[DynamicVoiceChannelService.upsertDynamicVoiceChannel] Error upserting configuration for serverId=${serverId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 刪除伺服器的動態語音頻道配置
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteDynamicVoiceChannel(serverId) {
    try {
      if (!serverId) {
        Logger.warn('[DynamicVoiceChannelService.deleteDynamicVoiceChannel] Missing serverId');
        throw new Error('Server ID is required to delete dynamic voice channels');
      }
      Logger.info(`[DynamicVoiceChannelService.deleteDynamicVoiceChannel] Deleting configuration for serverId=${serverId}`);
      await DynamicVoiceChannels.deleteByServerId(serverId);
      Logger.info(`[DynamicVoiceChannelService.deleteDynamicVoiceChannel] Deleted configuration for serverId=${serverId}`);
      return { success: true };
    } catch (error) {
      Logger.error(`[DynamicVoiceChannelService.deleteDynamicVoiceChannel] Error deleting configuration for serverId=${serverId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new DynamicVoiceChannelService();