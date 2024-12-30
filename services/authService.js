const axios = require('axios');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    // 驗證必要的環境變量
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.JWT_SECRET || !process.env.API_URL) {
      throw new Error('缺少必要的環境變量');
    }

    this.redirectUri = `${process.env.API_URL}:3000/auth/callback`;
    this.discordApiBaseUrl = 'https://discord.com/api';
    this.jwtSecret = process.env.JWT_SECRET;
  }

  /**
   * 獲取 Discord 的 access token
   * @param {string} code 授權碼
   * @returns {Promise<string>} 返回 access token
   */
  async getAccessToken(code) {
    try {
      const response = await axios.post(
        `${this.discordApiBaseUrl}/oauth2/token`,
        new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error fetching access token:', error.response?.data || error.message);
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
      const response = await axios.get(`${this.discordApiBaseUrl}/users/@me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
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
      return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
    } catch (error) {
      console.error('Error generating JWT:', error.message);
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
      const { id, avatar } = userInfo;
      if (avatar) {
        return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
      } else {
        const defaultAvatarId = BigInt(id) % 5n; // 默認頭像 ID（0-4）
        return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarId}.png`;
      }
    } catch (error) {
      console.error('Error generating avatar URL:', error.message);
      throw new Error('無法生成頭像 URL');
    }
  }
}

module.exports = new AuthService();