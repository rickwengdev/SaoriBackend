const ReactionRoleService = require('../services/reactionRoleService');

class ReactionRoleController {
  /**
   * 統一的錯誤處理響應
   * @param {Object} res - Express 響應對象
   * @param {Error} error - 錯誤對象
   * @param {String} message - 錯誤消息
   */
  handleError(res, error, message) {
    console.error(`[ReactionRoleController] ${message}:`, error.message);
    res.status(500).json({ success: false, message });
  }

  /**
   * 獲取伺服器的角色
   */
  async getRoles(req, res) {
    try {
      const { serverId } = req.params;
      const roles = await ReactionRoleService.fetchRoles(serverId);
      res.json({ success: true, data: roles });
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch roles');
    }
  }

  /**
   * 獲取伺服器的表情
   */
  async getEmojis(req, res) {
    try {
      const { serverId } = req.params;
      const emojis = await ReactionRoleService.fetchEmoji(serverId);
      res.json({ success: true, data: emojis });
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch emojis');
    }
  }

  /**
   * 獲取反應角色設置
   */
  async getReactionRoles(req, res) {
    try {
      const { serverId } = req.params;
      const reactionRoles = await ReactionRoleService.getReactionRolesByServer(serverId);
      res.status(200).json({ success: true, data: reactionRoles });
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch reaction roles');
    }
  }

  /**
   * 新增反應角色設置
   */
  async addReactionRole(req, res) {
    try {
      const { serverId } = req.params;
      const { channelId, messageId, emoji, roleId } = req.body;

      if (!channelId || !messageId || !emoji || !roleId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      await ReactionRoleService.addReactionRole(serverId, channelId, messageId, emoji, roleId);
      res.status(201).json({ success: true, message: 'Reaction role added successfully' });
    } catch (error) {
      this.handleError(res, error, 'Failed to add reaction role');
    }
  }

  /**
   * 刪除反應角色設置
   */
  async deleteReactionRole(req, res) {
    try {
      const { serverId } = req.params;
      const { messageId, emoji } = req.body;
      console.log(req.body);
      if (!messageId) {
        return res.status(400).json({ success: false, message: 'Message ID is required' });
      }

      await ReactionRoleService.deleteReactionRole(serverId, messageId, emoji);
      res.status(200).json({ success: true, message: 'Reaction role deleted successfully' });
    } catch (error) {
      this.handleError(res, error, 'Failed to delete reaction role');
    }
  }

  /**
   * 更新反應角色設置
   */
  async updateReactionRole(req, res) {
    try {
      const { serverId, messageId } = req.params;
      const { channelId, emoji, roleId } = req.body;

      if (!channelId || !emoji || !roleId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      await ReactionRoleService.updateReactionRole(serverId, messageId, channelId, emoji, roleId);
      res.status(200).json({ success: true, message: 'Reaction role updated successfully' });
    } catch (error) {
      this.handleError(res, error, 'Failed to update reaction role');
    }
  }
}

module.exports = new ReactionRoleController();