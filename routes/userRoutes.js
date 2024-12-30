const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

/**
 * 獲取用戶資料
 * GET /user/guilds
 */
router.get('/guilds', authenticateToken, (req, res) => userController.getGuilds(req, res));

module.exports = router;