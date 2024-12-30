const express = require('express');
const welcomeLeaveController = require('../controllers/welcomeLeaveController');
const router = express.Router();

/**
 * 獲取伺服器的歡迎與離開設定
 * GET /api/welcome-leave/:serverId/getWelcomeLeave
 */
router.get('/:serverId/getWelcomeLeave', welcomeLeaveController.getServerConfig);

/** 
 * 更新歡迎與離開設定
 * POST /api/welcome-leave/:serverId/updateWelcomeLeave
 */
router.post('/:serverId/updateWelcomeLeave', welcomeLeaveController.updateConfig);

/**
 * 刪除歡迎與離開設定
 * DELETE /api/welcome-leave/:serverId/deleteWelcomeLeave
 */
router.delete('/:serverId/deleteWelcomeLeave', welcomeLeaveController.deleteConfig);

module.exports = router;