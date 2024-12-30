const db = require('./db');

const Servers = {
    /**
     * 查詢伺服器資料
     * @param {string} serverId 伺服器 ID
     * @returns {Promise<Object>} 伺服器資料
     */
    async findById(serverId) {
        const [rows] = await db.query('SELECT * FROM Servers WHERE server_id = ?', [serverId]);
        return rows[0] || null;
    },

    /**
     * 創建伺服器資料
     * @param {Object} data 伺服器資料
     */
    async create(data) {
        const { serverId, serverName } = data;
        const sql = `
            INSERT INTO Servers (server_id, server_name)
            VALUES (?, ?)
        `;
        await db.query(sql, [serverId, serverName]);
    },
};

module.exports = Servers;