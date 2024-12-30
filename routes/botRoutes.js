const express = require('express');
const botController = require('../controllers/botController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

/**
 * 獲取機器人頭像 URL
 * GET /api/bot/bot-avatar
 */
router.get('/bot-avatar', (req, res) => botController.getBotAvatar(req, res));

/**
 * 檢查機器人是否在特定伺服器中
 * GET /api/bot/:serverId/checkBot
 */
router.get('/:serverId/checkBot', authenticateToken, (req, res) => {botController.checkBot(req, res);});

module.exports = router;