const TrackingMembers = require('../models/TrackingMember'); // 引入數據層模型
const Logger = require('./errorhandleService'); // 引入集中化 Logger

class TrackingMembersService {
    constructor() {
        Logger.info('TrackingMembersService initialized');
    }

    /**
     * 獲取伺服器的成員紀錄配置
     * @param {string} serverId - 伺服器 ID
     * @returns {Promise<Object|null>} 成員紀錄配置或 null
     */
    async getTrackingMemberConfig(serverId) {
        if (!serverId) {
            Logger.warn('[TrackingMembersService.getTrackingMemberConfig] Missing serverId');
            throw new Error('serverId is required');
        }

        try {
            const config = await TrackingMembers.findByServerId(serverId);
            if (!config) {
                Logger.info(`[TrackingMembersService.getTrackingMemberConfig] No configuration found for serverId=${serverId}`);
                return null;
            }
            Logger.info(`[TrackingMembersService.getTrackingMemberConfig] Configuration found for serverId=${serverId}`);
            return config;
        } catch (error) {
            Logger.error(`[TrackingMembersService.getTrackingMemberConfig] Error fetching configuration: ${error.message}`);
            throw new Error('Failed to fetch tracking member configuration');
        }
    }

    /**
     * 插入或更新伺服器的成員紀錄配置
     * @param {string} serverId - 伺服器 ID
     * @param {string} trackingChannelId - 成員紀錄頻道 ID
     * @returns {Promise<void>}
     */
    async upsertTrackingMemberConfig(serverId, trackingChannelId) {
        if (!serverId || !trackingChannelId) {
            Logger.warn('[TrackingMembersService.upsertTrackingMemberConfig] Missing parameters: serverId or trackingChannelId');
            throw new Error('serverId and trackingChannelId are required');
        }

        try {
            await TrackingMembers.upsert(serverId, trackingChannelId);
            Logger.info(`[TrackingMembersService.upsertTrackingMemberConfig] Configuration upserted for serverId=${serverId}`);
        } catch (error) {
            Logger.error(`[TrackingMembersService.upsertTrackingMemberConfig] Error upserting configuration: ${error.message}`);
            throw new Error('Failed to upsert tracking member configuration');
        }
    }

    /**
     * 刪除伺服器的成員紀錄配置
     * @param {string} serverId - 伺服器 ID
     * @returns {Promise<void>}
     */
    async deleteTrackingMemberConfig(serverId) {
        if (!serverId) {
            Logger.warn('[TrackingMembersService.deleteTrackingMemberConfig] Missing serverId');
            throw new Error('serverId is required');
        }

        try {
            await TrackingMembers.delete(serverId);
            Logger.info(`[TrackingMembersService.deleteTrackingMemberConfig] Configuration deleted for serverId=${serverId}`);
        } catch (error) {
            Logger.error(`[TrackingMembersService.deleteTrackingMemberConfig] Error deleting configuration: ${error.message}`);
            throw new Error('Failed to delete tracking member configuration');
        }
    }
}

module.exports = new TrackingMembersService();