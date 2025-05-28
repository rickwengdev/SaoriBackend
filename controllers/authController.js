const authService = require('../services/authService');
const Logger = require('../services/errorhandleService');

class AuthController {
  constructor() {
    this.dashboardUrl = `${process.env.API_URL}:443/dashboard`;
  }

  /**
   * 發起 Discord 認證
   */
  discordAuth(req, res) {
    Logger.info('Initiating Discord authentication process');
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(authService.redirectUri)}&response_type=code&scope=identify guilds`;
    res.redirect(authUrl);
  }

  /**
   * 處理 Discord 回調
   */
  async discordCallback(req, res) {
    const code = req.query.code;
    if (!code) {
      Logger.warn('Authorization code is missing in the callback request');
      return res.status(400).json({ error: '缺少授權碼' });
    }

    try {
      Logger.info('Processing Discord callback with authorization code');
      const accessToken = await authService.getAccessToken(code);
      const userInfo = await authService.getUserInfo(accessToken);

      Logger.info(`Successfully retrieved user info: ${userInfo.username}`);

      const token = authService.generateJwt({
        id: userInfo.id,
        username: userInfo.username,
        access_token: accessToken,
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'None',
      });

      Logger.info('User authentication successful, redirecting to dashboard');
      res.redirect(this.dashboardUrl);
    } catch (error) {
      Logger.error(`Authentication failed: ${error.response?.data || error.message}`);
      res.status(500).json({ error: '認證失敗' });
    }
  }

  /**
   * 檢查登錄狀態
   */
  checkAuthStatus(req, res) {
    if (!req.user) {
      Logger.info('Unauthorized access attempt to a protected resource');
      return res.status(401).json({ isLoggedIn: false, message: '用戶未登入' });
    }

    const { id, username } = req.user;
    Logger.info(`User is logged in: ${username} (ID: ${id})`);
    res.json({
      isLoggedIn: true,
      user: { id, username },
    });
  }

  /**
   * 登出
   */
  logout(req, res) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    Logger.info('User logged out successfully');
    res.json({ message: '已登出' });
  }

  /**
   * 獲取用戶頭像
   */
  async getUserAvatar(req, res) {
    const { access_token } = req.user;

    try {
      Logger.info('Fetching user avatar');
      const userInfo = await authService.getUserInfo(access_token);
      const avatarUrl = authService.getUserAvatarUrl(userInfo);
      Logger.info(`Successfully retrieved avatar URL for user: ${userInfo.username}`);
      res.json({ avatarUrl });
    } catch (error) {
      Logger.error(`Failed to fetch user avatar: ${error.response?.data || error.message}`);
      res.status(500).json({ error: '獲取用戶頭像失敗' });
    }
  }
}

module.exports = new AuthController();