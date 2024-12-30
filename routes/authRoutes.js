const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const AuthController = require('../controllers/authController');
const router = express.Router();

/**
 * 處理所有與身份驗證相關的路由
 * GET /api/auth/discord
 */
router.get('/discord', (req, res) => AuthController.discordAuth(req, res));

/**
 * 處理所有與身份驗證相關的路由
 * GET /api/auth/callback
 */
router.get('/callback', (req, res) => AuthController.discordCallback(req, res));

/**
 * 檢查登錄狀態
 * GET /api/auth/status
 */
router.get('/status', authenticateToken, (req, res) => AuthController.checkAuthStatus(req, res));

/**
 * 登出
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => AuthController.logout(req, res));

/**
 * 獲取用戶頭像
 * GET /api/auth/user-avatar
 */
router.get('/user-avatar', authenticateToken, (req, res) => AuthController.getUserAvatar(req, res));

module.exports = router;