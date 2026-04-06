const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

// ── Users ──────────────────────────────────────────────────────────────────

async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

async function getUserById(id) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

async function getUserByEmail(email) {
  const { data, error } = await supabase.from('users').select('*').ilike('email', email).single();
  if (error) return null;
  return data;
}

async function createUser({ name, email, password, role = 'viewer', status = 'active', phone, company, address, department }) {
  if (!name || !email || !password) throw new Error('Missing required user fields');
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
    join_date: new Date().toISOString().split('T')[0]
  };
  const { data, error } = await supabase.from('users').insert(user).select().single();
  if (error) {
    if (error.code === '23505') {
      const err = new Error('Email address already in use');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }
    throw error;
  }
  return data;
}

async function updateUser(id, changes) {
  const allowed = ['name', 'email', 'role', 'status', 'password', 'phone', 'company', 'address', 'department'];
  const update = {};
  allowed.forEach((f) => { if (changes[f] !== undefined) update[f] = changes[f]; });
  const { data, error } = await supabase.from('users').update(update).eq('id', id).select().single();
  if (error) return null;
  return data;
}

async function deleteUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  return !error;
}

// ── Records ────────────────────────────────────────────────────────────────

async function createRecord({ amount, type, category, date, notes, createdBy }) {
  const record = {
    id: uuidv4(),
    amount: Number(amount),
    type,
    category,
    date: date || new Date().toISOString(),
    notes: notes || '',
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('records').insert(record).select().single();
  if (error) throw error;
  return toRecordCamel(data);
}

async function getRecordById(id) {
  const { data, error } = await supabase.from('records').select('*').eq('id', id).single();
  if (error) return null;
  return toRecordCamel(data);
}

async function updateRecord(id, changes) {
  const allowed = ['amount', 'type', 'category', 'date', 'notes'];
  const update = { updated_at: new Date().toISOString() };
  allowed.forEach((f) => { if (changes[f] !== undefined) update[f] = changes[f]; });
  const { data, error } = await supabase.from('records').update(update).eq('id', id).select().single();
  if (error) return null;
  return toRecordCamel(data);
}

async function deleteRecord(id) {
  const { error } = await supabase.from('records').delete().eq('id', id);
  return !error;
}

async function filterRecords({ type, category, startDate, endDate }) {
  let query = supabase.from('records').select('*');
  if (type) query = query.eq('type', type);
  if (category) query = query.eq('category', category);
  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(toRecordCamel);
}

async function getRecords() {
  const { data, error } = await supabase.from('records').select('*');
  if (error) throw error;
  return data.map(toRecordCamel);
}

// Map snake_case DB columns → camelCase used in app
function toRecordCamel(r) {
  return {
    id: r.id,
    amount: r.amount,
    type: r.type,
    category: r.category,
    date: r.date,
    notes: r.notes,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

// ── Tokens ─────────────────────────────────────────────────────────────────

function createToken(userId) {
  const payload = `${userId}:${Date.now()}:${uuidv4()}`;
  return Buffer.from(payload).toString('base64');
}

async function getTokenUser(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    return await getUserById(userId);
  } catch {
    return null;
  }
}

async function getUserIdFromToken(token) {
  const user = await getTokenUser(token);
  return user ? user.id : null;
}

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
  getTokenUser,
  getUserIdFromToken
};
