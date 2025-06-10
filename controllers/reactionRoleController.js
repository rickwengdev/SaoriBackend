const ReactionRoleService = require('../services/reactionRoleService');
const Logger = require('../services/errorhandleService');

class ReactionRoleController {
  handleError(res, error, message) {
    Logger.error(`[ReactionRoleController] ${message}: ${error.message}`);
    res.status(500).json({ success: false, message });
  }

  /**
   * GET /api/:serverId/roles
   */
  async getRoles(req, res) {
    try {
      const { serverId } = req.params;
      if (!serverId) {
        return res.status(400).json({ success: false, message: 'Missing server ID' });
      }

      Logger.info(`[getRoles] Fetching roles for ${serverId}`);
      const roles = await ReactionRoleService.fetchRoles(serverId);
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch roles');
    }
  }

  /**
   * GET /api/:serverId/emojis
   */
  async getEmojis(req, res) {
    try {
      const { serverId } = req.params;
      if (!serverId) {
        return res.status(400).json({ success: false, message: 'Missing server ID' });
      }

      Logger.info(`[getEmojis] Fetching emojis for ${serverId}`);
      const emojis = await ReactionRoleService.fetchEmoji(serverId);
      res.status(200).json({ success: true, data: emojis });
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch emojis');
    }
  }

  /**
   * GET /api/:serverId/reaction-roles
   */
  async getReactionRoles(req, res) {
    try {
      const { serverId } = req.params;
      if (!serverId) {
        return res.status(400).json({ success: false, message: 'Missing server ID' });
      }

      Logger.info(`[getReactionRoles] Fetching reaction roles for ${serverId}`);
      const reactionRoles = await ReactionRoleService.getReactionRolesByServer(serverId);
      res.status(200).json({ success: true, data: reactionRoles });
    } catch (error) {
      this.handleError(res, error, 'Failed to fetch reaction roles');
    }
  }

  /**
   * POST /api/:serverId/reaction-roles
   */
  async addReactionRole(req, res) {
    try {
      const { serverId } = req.params;
      const { channelId, messageId, emoji, roleId } = req.body;

      if (!serverId || !channelId || !messageId || !emoji || !roleId) {
        Logger.warn(`[addReactionRole] Missing parameters for ${serverId}`);
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      Logger.info(`[addReactionRole] Adding reaction role to message ${messageId} in ${serverId}`);
      await ReactionRoleService.addReactionRole(serverId, channelId, messageId, emoji, roleId);
      res.status(201).json({ success: true, message: 'Reaction role added successfully' });
    } catch (error) {
      this.handleError(res, error, 'Failed to add reaction role');
    }
  }

  /**
   * DELETE /api/:serverId/reaction-roles
   */
  async deleteReactionRole(req, res) {
    try {
      const { serverId } = req.params;
      const { messageId, emoji } = req.body;

      if (!serverId || !messageId || !emoji) {
        Logger.warn(`[deleteReactionRole] Missing required fields for ${serverId}`);
        return res.status(400).json({ success: false, message: 'Server ID, message ID, and emoji are required' });
      }

      Logger.info(`[deleteReactionRole] Deleting reaction role for message ${messageId} in ${serverId}`);
      await ReactionRoleService.deleteReactionRole(serverId, messageId, emoji);
      res.status(200).json({ success: true, message: 'Reaction role deleted successfully' });
    } catch (error) {
      this.handleError(res, error, 'Failed to delete reaction role');
    }
  }

  /**
   * PUT /api/:serverId/reaction-roles/:messageId
   */
  async updateReactionRole(req, res) {
    try {
      const { serverId, messageId } = req.params;
      const { channelId, emoji, roleId } = req.body;

      if (!serverId || !messageId || !channelId || !emoji || !roleId) {
        Logger.warn(`[updateReactionRole] Missing required fields for ${serverId}`);
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      Logger.info(`[updateReactionRole] Updating reaction role for message ${messageId} in ${serverId}`);
      await ReactionRoleService.updateReactionRole(serverId, messageId, channelId, emoji, roleId);
      res.status(200).json({ success: true, message: 'Reaction role updated successfully' });
    } catch (error) {
      this.handleError(res, error, 'Failed to update reaction role');
    }
  }
}

module.exports = new ReactionRoleController();