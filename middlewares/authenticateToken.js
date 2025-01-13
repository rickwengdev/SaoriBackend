const jwt = require('jsonwebtoken');
const Logger = require('../services/errorhandleService'); // 引入集中化 Logger

/**
 * 認證器類，用於處理 JWT 認證
 */
class Authenticator {
  /**
   * 創建 Authenticator 實例
   * @param {string} secret - 用於簽名和驗證 JWT 的密鑰
   * @throws {Error} 如果未提供 JWT 密鑰
   */
  constructor(secret) {
    if (!secret) {
      throw new Error('JWT secret is required for Authenticator');
    }
    this.secret = secret;
  }

  /**
   * 驗證請求中的 JWT
   * @param {Object} req - Express 請求對象
   * @param {Object} res - Express 響應對象
   * @param {Function} next - Express 中間件鏈中的下一個函數
   * @returns {void}
   * @throws {Error} 如果 JWT 無效或缺失
   */
  authenticateToken(req, res, next) {
    const token = req.cookies.auth_token;

    if (!token) {
      Logger.warn('[Authenticator] Missing auth token in request cookies');
      return res.status(401).json({ message: '需要存取權杖' });
    }

    jwt.verify(token, this.secret, (err, user) => {
      if (err) {
        Logger.error('[Authenticator] Invalid token detected', { error: err.message });
        return res.status(403).json({ message: '權杖無效' });
      }

      Logger.info(`[Authenticator] Token successfully verified for user: ${user?.id || 'Unknown'}`);
      req.user = user;
      next();
    });
  }
}

// 導出單例的 `authenticateToken` 方法，綁定上下文
module.exports = new Authenticator(process.env.JWT_SECRET).authenticateToken.bind(
  new Authenticator(process.env.JWT_SECRET)
);