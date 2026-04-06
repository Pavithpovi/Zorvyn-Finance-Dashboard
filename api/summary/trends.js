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

  const interval = req.query.interval === 'weekly' ? 'weekly' : 'monthly';
  const records = getRecords();
  const result = {};

  records.forEach((r) => {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) return;
    let key;
    if (interval === 'weekly') {
      const year = d.getUTCFullYear();
      const week = Math.floor((d.getUTCDate() - 1) / 7) + 1;
      key = `${year}-W${String(week).padStart(2, '0')}`;
    } else {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      key = `${year}-${month}`;
    }
    if (!result[key]) result[key] = { income: 0, expense: 0, net: 0 };
    result[key][r.type] += Number(r.amount);
    result[key].net = result[key].income - result[key].expense;
  });

  res.json(result);
};