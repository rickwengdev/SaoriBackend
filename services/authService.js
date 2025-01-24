const axios = require('axios');
const jwt = require('jsonwebtoken');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

class AuthService {
  constructor() {
    // 驗證必要的環境變量
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.JWT_SECRET || !process.env.API_URL) {
      Logger.error('[AuthService.constructor] Missing required environment variables');
      throw new Error('缺少必要的環境變量');
    }

    this.redirectUri = `${process.env.API_URL}:3000/auth/callback`;
    this.discordApiBaseUrl = 'https://discord.com/api';
    this.jwtSecret = process.env.JWT_SECRET;

    Logger.info('[AuthService.constructor] AuthService initialized successfully');
  }

  /**
   * 獲取 Discord 的 access token
   * @param {string} code 授權碼
   * @returns {Promise<string>} 返回 access token
   */
  async getAccessToken(code) {
    try {
      Logger.info('[AuthService.getAccessToken] Fetching access token');
      const response = await axios.post(
        `${this.discordApiBaseUrl}/oauth2/token`,
        new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 5000, // 5 秒超時
        }
      );
      Logger.info('[AuthService.getAccessToken] Access token fetched successfully');
      return response.data.access_token;
    } catch (error) {
      // 記錄詳細錯誤信息
      Logger.error('[AuthService.getAccessToken] Error fetching access token:', {
        status: error.response?.status,
        data: error.response?.data || error.message,
      });
      throw new Error('無法獲取 Access Token');
    }
  }

  /**
   * 獲取 Discord 用戶基本信息
   * @param {string} accessToken Discord access token
   * @returns {Promise<object>} 返回用戶信息
   */
  async getUserInfo(accessToken) {
    try {
      Logger.info('[AuthService.getUserInfo] Fetching user info');
      const response = await axios.get(`${this.discordApiBaseUrl}/users/@me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      Logger.info('[AuthService.getUserInfo] User info fetched successfully');
      return response.data;
    } catch (error) {
      Logger.error('[AuthService.getUserInfo] Error fetching user info:', error.response?.data || error.message);
      throw new Error('無法獲取用戶信息');
    }
  }

  /**
   * 簽發 JWT
   * @param {object} payload JWT 載荷
   * @returns {string} 簽發的 JWT
   */
  generateJwt(payload) {
    try {
      Logger.info('[AuthService.generateJwt] Generating JWT');
      const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
      Logger.info('[AuthService.generateJwt] JWT generated successfully');
      return token;
    } catch (error) {
      Logger.error('[AuthService.generateJwt] Error generating JWT:', error.message);
      throw new Error('JWT 簽發失敗');
    }
  }

  /**
   * 獲取用戶頭像 URL
   * @param {object} userInfo Discord 用戶信息
   * @returns {string} 用戶頭像 URL
   */
  getUserAvatarUrl(userInfo) {
    try {
      Logger.info('[AuthService.getUserAvatarUrl] Generating user avatar URL');
      const { id, avatar } = userInfo;
      if (avatar) {
        return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
      } else {
        const defaultAvatarId = BigInt(id) % 5n; // 默認頭像 ID（0-4）
        return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarId}.png`;
      }
    } catch (error) {
      Logger.error('[AuthService.getUserAvatarUrl] Error generating avatar URL:', error.message);
      throw new Error('無法生成頭像 URL');
    }
  }
}

module.exports = new AuthService();