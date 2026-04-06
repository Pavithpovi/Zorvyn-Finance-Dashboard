const { createRecord, filterRecords, getUserIdFromToken, getUserById } = require('../../models');

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

const validateRecordBody = (req, res, next) => {
  const { amount, type, category } = req.body;
  if (amount === undefined || type === undefined || !category) {
    return res.status(400).json({ error: 'amount,type,category are required' });
  }
  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ error: 'type must be income or expense' });
  }
  if (Number.isNaN(Number(amount))) {
    return res.status(400).json({ error: 'amount must be a number' });
  }
  next();
};

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    // List/filter records
    const authCheck = requireRole(['admin', 'analyst', 'viewer']);
    await new Promise((resolve, reject) => {
      authCheck(req, res, resolve);
    });

    const { type, category, startDate, endDate } = req.query;
    const records = filterRecords({ type, category, startDate, endDate });
    res.json(records);
  } else if (req.method === 'POST') {
    // Create record
    const authCheck = requireRole(['admin']);
    await new Promise((resolve, reject) => {
      authCheck(req, res, resolve);
    });

    await new Promise((resolve, reject) => {
      validateRecordBody(req, res, resolve);
    });

    const record = createRecord({ ...req.body, createdBy: req.user.id });
    res.status(201).json(record);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};