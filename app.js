const express = require('express');
const bodyParser = require('express').json;
const path = require('path');
const { getUserByEmail, createToken, getAllUsers, createUser, updateUser, deleteUser } = require('./models');
const { authMiddleware, requireRole } = require('./middlewares');
const recordRouter = require('./routes/records');
const summaryRouter = require('./routes/summary');

const app = express();
app.use(bodyParser());

// Serve static files from dist in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

app.get('/', (req, res) => {
  res.send({ status: 'ok', service: 'Finance Dashboard Backend' });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ error: 'User is not active' });
  }
  const token = createToken(user.id);
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
});

app.post('/auth/register', (req, res) => {
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    if (err.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.get('/auth/me', authMiddleware, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, status: req.user.status } });
});

app.get('/users', authMiddleware, requireRole('admin', 'owner'), (req, res) => {
  res.json(getAllUsers().map((u) => ({ ...u, password: undefined })));
});

app.post('/users', authMiddleware, requireRole('admin'), (req, res) => {
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
    if (err.code === 'DUPLICATE_EMAIL') return res.status(409).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

app.put('/users/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const changes = req.body;
  if (changes.role && !['viewer', 'analyst', 'admin'].includes(changes.role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const user = updateUser(id, changes);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ ...user, password: undefined });
});

app.delete('/users/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const success = deleteUser(req.params.id);
  if (!success) return res.status(404).json({ error: 'User not found' });
  res.status(204).send();
});

app.use('/records', authMiddleware, recordRouter);
app.use('/summary', authMiddleware, summaryRouter);

// Serve React app for any unmatched routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
