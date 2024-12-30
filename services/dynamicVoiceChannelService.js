const DynamicVoiceChannels = require('../models/DynamicVoiceChannels');

class DynamicVoiceChannelService {
  /**
   * 獲取伺服器的動態語音頻道配置
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<object[]>} 動態語音頻道配置
   */
  async getDynamicVoiceChannels(serverId) {
    if (!serverId) {
      throw new Error('Server ID is required to fetch dynamic voice channels');
    }
    return await DynamicVoiceChannels.findByServerId(serverId);
  }

  /**
   * 新增或更新動態語音頻道配置
   * @param {string} serverId - 伺服器 ID
   * @param {string} baseChannelId - 基礎語音頻道 ID
   * @returns {Promise<{ success: boolean }>}
   */
  async upsertDynamicVoiceChannel(serverId, baseChannelId) {
    if (!serverId || !baseChannelId) {
      throw new Error('Server ID and Base Channel ID are required');
    }
    await DynamicVoiceChannels.upsert(serverId, baseChannelId);
    return { success: true };
  }

  /**
   * 刪除伺服器的動態語音頻道配置
   * @param {string} serverId - 伺服器 ID
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteDynamicVoiceChannel(serverId) {
    if (!serverId) {
      throw new Error('Server ID is required to delete dynamic voice channels');
    }
    await DynamicVoiceChannels.deleteByServerId(serverId);
    return { success: true };
  }
}

module.exports = new DynamicVoiceChannelService();