const DynamicVoiceChannelService = require('../services/dynamicVoiceChannelService');
const Logger = require('../services/errorhandleService'); // 引入 Logger

class DynamicVoiceChannelController {
  /**
   * 獲取伺服器的動態語音頻道配置
   * @param {object} req - Express 請求對象
   * @param {object} res - Express 響應對象
   */
  async getDynamicVoiceChannels(req, res) {
    const { serverId } = req.params;
    try {
      Logger.info(`Fetching dynamic voice channel configuration for server ID: ${serverId}`);
      const config = await DynamicVoiceChannelService.getDynamicVoiceChannels(serverId);
      Logger.info(`Successfully fetched configuration for server ID: ${serverId}`);
      res.status(200).json({ success: true, config });
    } catch (error) {
      Logger.error(`Error fetching dynamic voice channels for server ID ${serverId}: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch dynamic voice channel configuration' });
    }
  }

  /**
   * 新增或更新動態語音頻道配置
   * @param {object} req - Express 請求對象
   * @param {object} res - Express 響應對象
   */
  async upsertDynamicVoiceChannel(req, res) {
    const { serverId } = req.params;
    const { baseChannelId } = req.body;
    try {
      if (!baseChannelId) {
        Logger.warn('Base Channel ID is missing in the request body');
        return res.status(400).json({ error: 'Base Channel ID is required' });
      }
      Logger.info(`Upserting dynamic voice channel for server ID: ${serverId} with Base Channel ID: ${baseChannelId}`);
      await DynamicVoiceChannelService.upsertDynamicVoiceChannel(serverId, baseChannelId);
      Logger.info(`Successfully upserted dynamic voice channel for server ID: ${serverId}`);
      res.status(200).json({ success: true });
    } catch (error) {
      Logger.error(`Error upserting dynamic voice channel for server ID ${serverId}: ${error.message}`);
      res.status(500).json({ error: 'Failed to upsert dynamic voice channel configuration' });
    }
  }

  /**
   * 刪除伺服器的動態語音頻道配置
   * @param {object} req - Express 請求對象
   * @param {object} res - Express 響應對象
   */
  async deleteDynamicVoiceChannel(req, res) {
    const { serverId } = req.params;
    try {
      Logger.info(`Deleting dynamic voice channel configuration for server ID: ${serverId}`);
      await DynamicVoiceChannelService.deleteDynamicVoiceChannel(serverId);
      Logger.info(`Successfully deleted dynamic voice channel configuration for server ID: ${serverId}`);
      res.status(200).json({ success: true });
    } catch (error) {
      Logger.error(`Error deleting dynamic voice channel for server ID ${serverId}: ${error.message}`);
      res.status(500).json({ error: 'Failed to delete dynamic voice channel configuration' });
    }
  }
}

module.exports = new DynamicVoiceChannelController();