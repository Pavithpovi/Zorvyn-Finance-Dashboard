const { getAllUsers, createUser, getUserIdFromToken, getUserById } = require('../../models');

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
  // Middleware to check auth and role
  const authCheck = requireRole(['admin', 'owner']);
  await new Promise((resolve, reject) => {
    authCheck(req, res, resolve);
  });

  if (req.method === 'GET') {
    // List all users
    const users = getAllUsers().map((u) => ({ ...u, password: undefined }));
    res.json(users);
  } else if (req.method === 'POST') {
    // Create new user (admin only)
    const adminCheck = requireRole(['admin']);
    await new Promise((resolve, reject) => {
      adminCheck(req, res, resolve);
    });

    const { name, email, role, status, password, phone, company, address, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name,email,password required' });
    }

    const allowedRoles = ['viewer', 'owner', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role value' });
    }

    try {
      const user = createUser({
        name,
        email,
        role,
        status: status || 'active',
        password,
        phone,
        company,
        address,
        department,
        joinDate: new Date().toISOString().split('T')[0]
      });
      res.status(201).json({ ...user, password: undefined });
    } catch (err) {
      if (err.code === 'DUPLICATE_EMAIL') {
        return res.status(409).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};