const db = require('./db');

const WelcomeLeaveConfig = {
  /**
   * 查找指定伺服器的歡迎/離開訊息設定
   * @param {string} serverId
   * @returns {Object|null} 記錄或 null
   */
  async findByServerId(serverId) {
    const [rows] = await db.query(
      'SELECT * FROM WelcomeLeaveConfig WHERE server_id = ?',
      [serverId]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * 插入或更新歡迎和離開頻道設定
   * @param {string} serverId
   * @param {Object} config 包含 `welcomeChannelId` 和/或 `leaveChannelId`
   * @returns {void}
   */
  async upsert(serverId, config) {
    const { welcomeChannelId, leaveChannelId } = config;

    const existingConfig = await this.findByServerId(serverId);

    if (existingConfig) {
      // 更新現有記錄
      const updateFields = [];
      const updateValues = [];

      if (welcomeChannelId !== undefined) {
        updateFields.push('welcome_channel_id = ?');
        updateValues.push(welcomeChannelId);
      }
      if (leaveChannelId !== undefined) {
        updateFields.push('leave_channel_id = ?');
        updateValues.push(leaveChannelId);
      }

      if (updateFields.length > 0) {
        await db.query(
          `UPDATE WelcomeLeaveConfig SET ${updateFields.join(', ')} WHERE server_id = ?`,
          [...updateValues, serverId]
        );
      }
    } else {
      // 插入新記錄
      await db.query(
        'INSERT INTO WelcomeLeaveConfig (server_id, welcome_channel_id, leave_channel_id) VALUES (?, ?, ?)',
        [serverId, welcomeChannelId || null, leaveChannelId || null]
      );
    }
  },

  /**
   * 刪除指定伺服器的設定
   * @param {string} serverId
   * @returns {void}
   */
  async delete(serverId) {
    await db.query('DELETE FROM WelcomeLeaveConfig WHERE server_id = ?', [serverId]);
  },
};

module.exports = WelcomeLeaveConfig;