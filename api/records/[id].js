const { getRecordById, updateRecord, deleteRecord, getUserIdFromToken, getUserById } = require('../../models');

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
  const { id } = req.query;

  if (req.method === 'GET') {
    const authCheck = requireRole(['admin', 'analyst', 'viewer']);
    await new Promise((resolve, reject) => {
      authCheck(req, res, resolve);
    });

    const record = getRecordById(id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } else if (req.method === 'PUT') {
    const authCheck = requireRole(['admin']);
    await new Promise((resolve, reject) => {
      authCheck(req, res, resolve);
    });

    await new Promise((resolve, reject) => {
      validateRecordBody(req, res, resolve);
    });

    const record = updateRecord(id, req.body);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } else if (req.method === 'DELETE') {
    const authCheck = requireRole(['admin']);
    await new Promise((resolve, reject) => {
      authCheck(req, res, resolve);
    });

    const deleted = deleteRecord(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(204).send();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};