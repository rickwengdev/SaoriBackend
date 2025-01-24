const express = require('express');
const trackingMembersController = require('../controllers/trackingMembersController');
const router = express.Router();

/**
 * 獲取伺服器的成員紀錄配置
 * GET /:serverId/trackingMembers
 */
router.get('/:serverId/trackingMembers', trackingMembersController.getTrackingConfig);

/**
 * 插入或更新伺服器的成員紀錄配置
 * POST /:serverId/trackingMembers
 */
router.post('/:serverId/trackingMembers', trackingMembersController.upsertTrackingConfig);

/**
 * 刪除伺服器的成員紀錄配置
 * DELETE /:serverId/trackingMembers
 */
router.delete('/:serverId/trackingMembers', trackingMembersController.deleteTrackingConfig);

module.exports = router;