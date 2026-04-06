const { createUser } = require('../../models');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, role, phone, company, address, department } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const allowedRoles = ['viewer', 'owner', 'admin'];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role value' });
  }

  try {
    const user = createUser({
      name,
      email,
      role: role || 'viewer',
      status: 'active',
      password,
      phone,
      company,
      address,
      department,
      joinDate: new Date().toISOString().split('T')[0]
    });
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    if (err.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};