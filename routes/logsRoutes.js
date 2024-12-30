const express = require('express');
const LogsController = require('../controllers/logsController');
const router = express.Router();

/**
 * 獲取伺服器的日誌頻道
 * GET /api/logs/:serverId/log-channel
 */
router.get('/:serverId/log-channel', (req, res) => {
    LogsController.getLogChannel(req, res);
});

/**
 * 設置或更新伺服器的日誌頻道
 * POST /api/logs/:serverId/log-channel
 */
router.post('/:serverId/log-channel', (req, res) => {
    LogsController.setLogChannel(req, res);
});

/**
 * 刪除伺服器的日誌頻道
 * DELETE /api/logs/:serverId/log-channel
 */
router.delete('/:serverId/log-channel', (req, res) => {
    LogsController.deleteLogChannel(req, res);
});

module.exports = router;