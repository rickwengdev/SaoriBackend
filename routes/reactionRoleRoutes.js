const express = require('express');
const reactionRoleController = require('../controllers/reactionRoleController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

/**
 * 獲取伺服器的反應角色設定
 * GET /api/reaction-role/:serverId/reaction-roles
 */
router.get('/:serverId/roles', async (req, res, next) => {
  try {
    await reactionRoleController.getRoles(req, res);
  } catch (error) {
    next(error); // 傳遞錯誤給 Express 錯誤處理中間件
  }
});

/**
 * 獲取伺服器的反應角色設定
 * GET /api/reaction-role/:serverId/reaction-roles
 */
router.get('/:serverId/reaction-roles', async (req, res, next) => {
  try {
    await reactionRoleController.getReactionRoles(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * 新增或更新伺服器的反應角色設定
 * POST /api/reaction-role/:serverId/reaction-roles
 */
router.get('/:serverId/emojis', authenticateToken, async (req, res, next) => {
  try {
    await reactionRoleController.getEmojis(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * 更新伺服器的反應角色設定
 * PUT /api/reaction-role/:serverId/reaction-roles
 */
router.post('/:serverId/reaction-roles', authenticateToken, async (req, res, next) => {
  try {
    await reactionRoleController.addReactionRole(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * 刪除伺服器的反應角色設定
 * DELETE /api/reaction-role/:serverId/reaction-roles
 */
router.delete('/:serverId/reaction-roles', authenticateToken, async (req, res, next) => {
  try {
    await reactionRoleController.deleteReactionRole(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * 更新伺服器的反應角色設定
 * PUT /api/reaction-role/:serverId/reaction-roles
 */
router.put('/:serverId/reaction-roles', authenticateToken, async (req, res, next) => {
  try {
    await reactionRoleController.updateReactionRole(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;