const { getUserById, updateUser, deleteUser, getUserIdFromToken } = require('../../models');

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
  const { id } = req.query;

  // Middleware to check auth and role
  const authCheck = requireRole(['admin']);
  await new Promise((resolve, reject) => {
    authCheck(req, res, resolve);
  });

  if (req.method === 'GET') {
    const user = getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ ...user, password: undefined });
  } else if (req.method === 'PUT') {
    const changes = req.body;
    if (changes.role && !['viewer', 'analyst', 'admin'].includes(changes.role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = updateUser(id, changes);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ ...user, password: undefined });
  } else if (req.method === 'DELETE') {
    const success = deleteUser(id);
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};