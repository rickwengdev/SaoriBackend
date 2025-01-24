const TrackingMembersService = require('../services/trackingMembersServices');
const Logger = require('../services/errorhandleService');

class TrackingMembersController {

  /**
   * 獲取伺服器的成員紀錄配置
   */
  async getTrackingConfig(req, res) {
    const { serverId } = req.params;

    try {
      const config = await TrackingMembersService.getTrackingMemberConfig(serverId);

      if (!config) {
        Logger.info(`[TrackingMembersController.getTrackingConfig] No configuration found for serverId=${serverId}`);
        return res.status(404).json({
          success: false,
          message: '伺服器的成員紀錄配置不存在',
        });
      }

      Logger.info(`[TrackingMembersController.getTrackingConfig] Successfully fetched configuration for serverId=${serverId}`);
      res.json({ success: true, config });
    } catch (error) {
      Logger.error(`[TrackingMembersController.getTrackingConfig] Error fetching configuration: ${error.message || error}`);
      res.status(500).json({
        success: false,
        error: '無法獲取伺服器的成員紀錄配置，請稍後再試',
      });
    }
  }

  /**
   * 插入或更新伺服器的成員紀錄配置
   */
  async upsertTrackingConfig(req, res) {
    const { serverId } = req.params;
    const { trackingChannelId } = req.body;

    try {
      await TrackingMembersService.upsertTrackingMemberConfig(serverId, trackingChannelId);

      Logger.info(`[TrackingMembersController.upsertTrackingConfig] Successfully upserted configuration for serverId=${serverId}`);
      res.json({
        success: true,
        message: '伺服器的成員紀錄配置已成功更新或新增',
      });
    } catch (error) {
      Logger.error(`[TrackingMembersController.upsertTrackingConfig] Error upserting configuration: ${error.message || error}`);
      res.status(500).json({
        success: false,
        error: '無法更新或新增伺服器的成員紀錄配置，請稍後再試',
      });
    }
  }

  /**
   * 刪除伺服器的成員紀錄配置
   */
  async deleteTrackingConfig(req, res) {
    const { serverId } = req.params;

    try {
      await TrackingMembersService.deleteTrackingMemberConfig(serverId);

      Logger.info(`[TrackingMembersController.deleteTrackingConfig] Successfully deleted configuration for serverId=${serverId}`);
      res.json({
        success: true,
        message: '伺服器的成員紀錄配置已成功刪除',
      });
    } catch (error) {
      Logger.error(`[TrackingMembersController.deleteTrackingConfig] Error deleting configuration: ${error.message || error}`);
      res.status(500).json({
        success: false,
        error: '無法刪除伺服器的成員紀錄配置，請稍後再試',
      });
    }
  }
}

module.exports = new TrackingMembersController();