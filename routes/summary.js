const express = require('express');
const router = express.Router();
const { getRecords } = require('../models');
const { requireRole } = require('../middlewares');

const allRoles = ['admin', 'analyst', 'viewer', 'owner'];

router.get('/overview', requireRole(...allRoles), async (req, res) => {
  try {
    const records = await getRecords();
    const income = records.filter((r) => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
    const expense = records.filter((r) => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);
    res.json({ income, expense, net: income - expense, totalTransactions: records.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', requireRole(...allRoles), async (req, res) => {
  try {
    const records = await getRecords();
    const totals = {};
    records.forEach((r) => {
      const key = `${r.category}:${r.type}`;
      totals[key] = (totals[key] || 0) + Number(r.amount);
    });
    res.json(Object.entries(totals).map(([k, v]) => {
      const [category, type] = k.split(':');
      return { category, type, total: v };
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trends', requireRole(...allRoles), async (req, res) => {
  try {
    const interval = req.query.interval === 'weekly' ? 'weekly' : 'monthly';
    const records = await getRecords();
    const result = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      if (Number.isNaN(d.getTime())) return;
      let key;
      if (interval === 'weekly') {
        key = `${d.getUTCFullYear()}-W${String(Math.floor((d.getUTCDate() - 1) / 7) + 1).padStart(2, '0')}`;
      } else {
        key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      }
      if (!result[key]) result[key] = { income: 0, expense: 0, net: 0 };
      result[key][r.type] += Number(r.amount);
      result[key].net = result[key].income - result[key].expense;
    });
    res.json(Object.entries(result).map(([period, stats]) => ({ period, ...stats })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent', requireRole(...allRoles), async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const records = (await getRecords()).sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(records.slice(0, limit));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
