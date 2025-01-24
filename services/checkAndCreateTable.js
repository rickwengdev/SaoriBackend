const db = require('../models/db'); // 封裝的資料庫連接模組
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

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
      {
        name: 'TrackingMembers',
        schema: `
          CREATE TABLE TrackingMembers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            server_id VARCHAR(255) NOT NULL UNIQUE,
            trackingmembers_channel_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (server_id) REFERENCES Servers(server_id) ON DELETE CASCADE
          );
        `,
      }
    ];
  }

  // 檢查單個表是否存在
  async isTableExists(tableName) {
    try {
      Logger.info(`[DatabaseService.isTableExists] Checking if table "${tableName}" exists`);
      const [rows] = await db.query(
        `
        SELECT COUNT(*) AS tableExists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() AND table_name = ?;
        `,
        [tableName]
      );
      const exists = rows[0].tableExists > 0;
      Logger.info(`[DatabaseService.isTableExists] Table "${tableName}" exists: ${exists}`);
      return exists;
    } catch (error) {
      Logger.error(`[DatabaseService.isTableExists] Error checking table "${tableName}": ${error.message}`);
      throw error;
    }
  }

  // 創建單個表
  async createTable(schema) {
    try {
      Logger.info(`[DatabaseService.createTable] Creating table with schema: ${schema}`);
      await db.query(schema);
      Logger.info(`[DatabaseService.createTable] Table created successfully`);
    } catch (error) {
      Logger.error(`[DatabaseService.createTable] Error creating table: ${error.message}`);
      throw error;
    }
  }

  // 檢查並創建所有表
  async checkAndCreateAllTables() {
    for (const table of this.tables) {
      try {
        Logger.info(`[DatabaseService.checkAndCreateAllTables] Checking table "${table.name}"`);
        const exists = await this.isTableExists(table.name);
        if (!exists) {
          Logger.info(`[DatabaseService.checkAndCreateAllTables] Table "${table.name}" does not exist. Creating...`);
          await this.createTable(table.schema);
          Logger.info(`[DatabaseService.checkAndCreateAllTables] Table "${table.name}" created successfully`);
        } else {
          Logger.info(`[DatabaseService.checkAndCreateAllTables] Table "${table.name}" already exists`);
        }
      } catch (error) {
        Logger.error(`[DatabaseService.checkAndCreateAllTables] Error processing table "${table.name}": ${error.message}`);
      }
    }
  }
}

module.exports = new DatabaseService();