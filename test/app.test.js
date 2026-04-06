const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../app');

const DATA_PATH = path.join(__dirname, '..', 'data.json');
const originalData = fs.readFileSync(DATA_PATH, 'utf8');

afterAll(() => {
  fs.writeFileSync(DATA_PATH, originalData, 'utf8');
});

describe('Finance Dashboard API', () => {
  let adminToken;
  let viewerToken;

  test('Admin login works', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'admin@example.com', password: 'admin123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  test('Viewer login works', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'viewer@example.com', password: 'view123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    viewerToken = res.body.token;
  });

  test('Admin can create financial record', async () => {
    const res = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 120, type: 'income', category: 'sales', date: '2026-04-01', notes: 'test set' });
    expect(res.statusCode).toBe(201);
    expect(res.body.type).toBe('income');
    expect(res.body.amount).toBe(120);
  });

  test('Viewer cannot create financial record', async () => {
    const res = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 42, type: 'expense', category: 'food', date: '2026-04-01', notes: 'test blocked' });
    expect(res.statusCode).toBe(403);
  });

  test('Summary overview contains totals and net', async () => {
    const res = await request(app).get('/summary/overview').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('income');
    expect(res.body).toHaveProperty('expense');
    expect(res.body).toHaveProperty('net');
    expect(res.body.totalTransactions).toBeGreaterThanOrEqual(1);
  });
});
