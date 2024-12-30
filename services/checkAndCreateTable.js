const db = require('../models/db'); // 封裝的資料庫連接模組

class DatabaseService {
  constructor() {
    this.tables = [
      {
        name: 'Servers',
        schema: `
          CREATE TABLE Servers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL UNIQUE,
            server_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
      },
      {
        name: 'ReactionRoles',
        schema: `
          CREATE TABLE ReactionRoles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            channel_id VARCHAR(255) NOT NULL,
            message_id VARCHAR(255) NOT NULL,
            emoji VARCHAR(255) NOT NULL,
            role_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES Servers(server_id) ON DELETE CASCADE
          );
        `,
      },
      {
        name: 'DynamicVoiceChannels',
        schema: `
          CREATE TABLE DynamicVoiceChannels (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            base_channel_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES Servers(server_id) ON DELETE CASCADE
          );
        `,
      },
      {
        name: 'Logs',
        schema: `
          CREATE TABLE Logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            log_channel_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES Servers(server_id) ON DELETE CASCADE
          );
        `,
      },
      {
        name: 'WelcomeLeaveConfig',
        schema: `
          CREATE TABLE WelcomeLeaveConfig (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL,
            welcome_channel_id VARCHAR(255),
            leave_channel_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES Servers(server_id) ON DELETE CASCADE
          );
        `,
      },
    ];
  }

  // 檢查單個表是否存在
  async isTableExists(tableName) {
    try {
      const [rows] = await db.query(
        `
        SELECT COUNT(*) AS tableExists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() AND table_name = ?;
        `,
        [tableName]
      );
      return rows[0].tableExists > 0;
    } catch (error) {
      console.error(`檢查表 "${tableName}" 是否存在時出錯:`, error.message);
      throw error;
    }
  }

  // 創建單個表
  async createTable(schema) {
    try {
      await db.query(schema);
    } catch (error) {
      console.error('創建表時出錯:', error.message);
      throw error;
    }
  }

  // 檢查並創建所有表
  async checkAndCreateAllTables() {
    for (const table of this.tables) {
      try {
        const exists = await this.isTableExists(table.name);
        if (!exists) {
          console.log(`Table "${table.name}" 不存在，正在創建...`);
          await this.createTable(table.schema);
          console.log(`Table "${table.name}" 已成功創建。`);
        } else {
          console.log(`Table "${table.name}" 已存在，無需創建。`);
        }
      } catch (error) {
        console.error(`檢查或創建表 "${table.name}" 時出錯:`, error.message);
      }
    }
  }
}

module.exports = new DatabaseService();