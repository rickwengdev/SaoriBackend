const express = require('express');
const channelController = require('../controllers/channelController');
const router = express.Router();

/**
 * 獲取伺服器頻道列表
 * GET /api/channel/:serverId/channels
 */
router.get('/:serverId/channels', (req, res) => 
    channelController.getGuildChannels(req, res)
);

module.exports = router;