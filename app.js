require('dotenv').config();
const express = require('express');
const path = require('path');
const { getUserByEmail, createToken, getAllUsers, createUser, updateUser, deleteUser } = require('./models');
const { authMiddleware, requireRole } = require('./middlewares');
const recordRouter = require('./routes/records');
const summaryRouter = require('./routes/summary');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? undefined : '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

app.get('/', (req, res) => res.json({ status: 'ok', service: 'Finance Dashboard Backend' }));

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = await getUserByEmail(email);
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ error: 'User is not active' });
    const token = createToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, company, address, department } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    const allowedRoles = ['viewer', 'owner', 'admin'];
    if (role && !allowedRoles.includes(role)) return res.status(400).json({ error: 'Invalid role value' });
    const user = await createUser({ name, email, role: role || 'viewer', status: 'active', password, phone, company, address, department });
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err.code === 'DUPLICATE_EMAIL') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const { id, name, email, role, status } = req.user;
  res.json({ user: { id, name, email, role, status } });
});

app.get('/api/users', authMiddleware, requireRole('admin', 'owner'), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users.map((u) => ({ ...u, password: undefined })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, role, status, password, phone, company, address, department } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name,email,password required' });
    const allowedRoles = ['viewer', 'owner', 'admin'];
    if (!allowedRoles.includes(role)) return res.status(400).json({ error: 'Invalid role value' });
    const user = await createUser({ name, email, role, status: status || 'active', password, phone, company, address, department });
    res.status(201).json({ ...user, password: undefined });
  } catch (err) {
    if (err.code === 'DUPLICATE_EMAIL') return res.status(409).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const changes = req.body;
    if (changes.role && !['viewer', 'owner', 'admin'].includes(changes.role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await updateUser(req.params.id, changes);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user, password: undefined });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const success = await deleteUser(req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/records', authMiddleware, recordRouter);
app.use('/api/summary', authMiddleware, summaryRouter);

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
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
