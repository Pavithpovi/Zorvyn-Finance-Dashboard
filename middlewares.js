const { getTokenUser } = require('./models');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = auth.split(' ')[1];
  const user = getTokenUser(token);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ error: 'Invalid token or user inactive' });
  }
  req.user = user;
  next();
}

function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(500).json({ error: 'User not loaded' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole };
