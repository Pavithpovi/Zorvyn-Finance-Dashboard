const { getRecords, getUserIdFromToken, getUserById } = require('../../models');

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = getUserById(userId);
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = user;
    next();
  };
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authCheck = requireRole(['admin', 'analyst', 'viewer']);
  await new Promise((resolve, reject) => {
    authCheck(req, res, resolve);
  });

  const records = getRecords();
  const categoryTotals = {};
  records.forEach((r) => {
    const key = `${r.category}:${r.type}`;
    categoryTotals[key] = (categoryTotals[key] || 0) + Number(r.amount);
  });
  const output = Object.entries(categoryTotals).map(([k, v]) => {
    const [category, type] = k.split(':');
    return { category, type, total: v };
  });
  res.json(output);
};