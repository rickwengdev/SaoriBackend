const DynamicVoiceChannelService = require('../services/dynamicVoiceChannelService');

class DynamicVoiceChannelController {
  /**
   * 獲取伺服器的動態語音頻道配置
   * @param {object} req - Express 請求對象
   * @param {object} res - Express 響應對象
   */
  async getDynamicVoiceChannels(req, res) {
    const { serverId } = req.params;
    try {
      const config = await DynamicVoiceChannelService.getDynamicVoiceChannels(serverId);
      res.status(200).json({success: true, config});
    } catch (error) {
      console.error('Error fetching dynamic voice channels:', error.message);
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
        return res.status(400).json({ error: 'Base Channel ID is required' });
      }
      await DynamicVoiceChannelService.upsertDynamicVoiceChannel(serverId, baseChannelId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error upserting dynamic voice channel:', error.message);
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
      await DynamicVoiceChannelService.deleteDynamicVoiceChannel(serverId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting dynamic voice channel:', error.message);
      res.status(500).json({ error: 'Failed to delete dynamic voice channel configuration' });
    }
  }
}

module.exports = new DynamicVoiceChannelController();