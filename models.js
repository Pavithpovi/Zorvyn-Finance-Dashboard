const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'data.json');

const defaultData = {
  users: [
    {
      id: 'admin-001',
      name: 'System Administrator',
      email: 'admin@zorvyn.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      phone: '+1-555-0101',
      company: 'Zorvyn Finance Corp',
      address: '123 Admin Street, Tech City, TC 12345',
      department: 'IT Administration',
      joinDate: '2024-01-01'
    },
    {
      id: 'owner-001',
      name: 'Business Owner',
      email: 'owner@zorvyn.com',
      password: 'owner123',
      role: 'owner',
      status: 'active',
      phone: '+1-555-0102',
      company: 'Zorvyn Enterprises',
      address: '456 Owner Avenue, Business City, BC 67890',
      department: 'Executive Management',
      joinDate: '2024-01-15'
    },
    {
      id: 'viewer-001',
      name: 'Data Viewer',
      email: 'viewer@zorvyn.com',
      password: 'viewer123',
      role: 'viewer',
      status: 'active',
      phone: '+1-555-0103',
      company: 'Zorvyn Analytics',
      address: '789 Viewer Blvd, Data City, DC 54321',
      department: 'Data Analysis',
      joinDate: '2024-02-01'
    }
  ],
  records: [],
  tokens: {}
};

let store = JSON.parse(JSON.stringify(defaultData));

function loadData() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      store = JSON.parse(raw);
    } catch (err) {
      console.error('Failed reading data file: - models.js:25', err);
      store = JSON.parse(JSON.stringify(defaultData));
    }
  } else {
    saveData();
  }
}

function saveData() {
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

function getAllUsers() {
  return [...store.users];
}

function getUserById(id) {
  return store.users.find((u) => u.id === id);
}

function getUserByEmail(email) {
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function createUser({ name, email, password, role = 'viewer', status = 'active', phone, company, address, department }) {
  if (!name || !email || !password) {
    throw new Error('Missing required user fields');
  }
  if (getUserByEmail(email)) {
    const err = new Error('Email address already in use');
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }
  const user = {
    id: uuidv4(),
    name,
    email,
    password,
    role,
    status,
    phone: phone || '',
    company: company || '',
    address: address || '',
    department: department || '',
    joinDate: new Date().toISOString().split('T')[0]
  };
  store.users.push(user);
  saveData();
  return user;
}

function updateUser(id, changes) {
  const user = getUserById(id);
  if (!user) return null;
  const allowed = ['name', 'email', 'role', 'status', 'password', 'phone', 'company', 'address', 'department'];
  allowed.forEach((field) => {
    if (changes[field] !== undefined) user[field] = changes[field];
  });
  saveData();
  return user;
}

function deleteUser(id) {
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  store.users.splice(idx, 1);
  saveData();
  return true;
}

function createRecord({ amount, type, category, date, notes, createdBy }) {
  const record = {
    id: uuidv4(),
    amount: Number(amount),
    type,
    category,
    date: date || new Date().toISOString(),
    notes: notes || '',
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.records.push(record);
  saveData();
  return record;
}

function getRecordById(id) {
  return store.records.find((r) => r.id === id);
}

function updateRecord(id, changes) {
  const record = getRecordById(id);
  if (!record) return null;
  const allowed = ['amount', 'type', 'category', 'date', 'notes'];
  allowed.forEach((field) => {
    if (changes[field] !== undefined) record[field] = changes[field];
  });
  record.updatedAt = new Date().toISOString();
  saveData();
  return record;
}

function deleteRecord(id) {
  const idx = store.records.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  store.records.splice(idx, 1);
  saveData();
  return true;
}

function filterRecords({ type, category, startDate, endDate }) {
  return store.records.filter((rec) => {
    let ok = true;
    if (type) ok = ok && rec.type === type;
    if (category) ok = ok && rec.category === category;
    if (startDate) ok = ok && new Date(rec.date) >= new Date(startDate);
    if (endDate) ok = ok && new Date(rec.date) <= new Date(endDate);
    return ok;
  });
}

function createToken(userId) {
  const token = uuidv4();
  store.tokens[token] = { userId, createdAt: new Date().toISOString() };
  saveData();
  return token;
}

function getTokenUser(token) {
  const entry = store.tokens[token];
  if (!entry) return null;
  return getUserById(entry.userId);
}

function getRecords() {
  return [...store.records];
}

loadData();

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  createRecord,
  getRecordById,
  updateRecord,
  deleteRecord,
  filterRecords,
  getRecords,
  createToken,
  getTokenUser
};
