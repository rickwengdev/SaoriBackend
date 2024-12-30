const authService = require('../services/authService');

class AuthController {
  constructor() {
    this.dashboardUrl = `${process.env.API_URL}:8080/dashboard`;
  }

  /**
   * 發起 Discord 認證
   */
  discordAuth(req, res) {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(authService.redirectUri)}&response_type=code&scope=identify guilds`;
    res.redirect(authUrl);
  }

  /**
   * 處理 Discord 回調
   */
  async discordCallback(req, res) {
    const code = req.query.code;
    if (!code) {
      console.warn('缺少授權碼');
      return res.status(400).json({ error: '缺少授權碼' });
    }

    try {
      const accessToken = await authService.getAccessToken(code);
      const userInfo = await authService.getUserInfo(accessToken);

      const token = authService.generateJwt({
        id: userInfo.id,
        username: userInfo.username,
        access_token: accessToken,
      });

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });

      res.redirect(this.dashboardUrl);
    } catch (error) {
      console.error('認證失敗:', error.response?.data || error.message);
      res.status(500).json({ error: '認證失敗' });
    }
  }

  /**
   * 檢查登錄狀態
   */
  checkAuthStatus(req, res) {
    if (!req.user) {
      console.info('未授權用戶嘗試訪問受保護的資源');
      return res.status(401).json({ isLoggedIn: false, message: '用戶未登入' });
    }

    const { id, username } = req.user;
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
    console.info('用戶已登出');
    res.json({ message: '已登出' });
  }

  /**
   * 獲取用戶頭像
   */
  async getUserAvatar(req, res) {
    const { access_token } = req.user;

    try {
      const userInfo = await authService.getUserInfo(access_token);
      const avatarUrl = authService.getUserAvatarUrl(userInfo);
      res.json({ avatarUrl });
    } catch (error) {
      console.error('無法獲取用戶頭像:', error.response?.data || error.message);
      res.status(500).json({ error: '獲取用戶頭像失敗' });
    }
  }
}

module.exports = new AuthController();