const jwt = require('jsonwebtoken');

class Authenticator {
  constructor(secret) {
    if (!secret) {
      throw new Error('JWT secret is required for Authenticator');
    }
    this.secret = secret;
  }

  authenticateToken(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: '需要存取權杖' });
    }

    jwt.verify(token, this.secret, (err, user) => {
      if (err) {
        return res.status(403).json({ message: '權杖無效' });
      }
      req.user = user;
      next();
    });
  }
}

// 導出單例的 `authenticateToken` 方法，綁定上下文
module.exports = new Authenticator(process.env.JWT_SECRET).authenticateToken.bind(
  new Authenticator(process.env.JWT_SECRET)
);