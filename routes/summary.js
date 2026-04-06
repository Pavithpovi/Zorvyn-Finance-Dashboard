const express = require('express');
const router = express.Router();
const { getRecords } = require('../models');
const { requireRole } = require('../middlewares');

router.get('/overview', requireRole('admin', 'analyst', 'viewer'), (req, res) => {
  const records = getRecords();
  const income = records.filter((r) => r.type === 'income').reduce((sum, r) => sum + Number(r.amount), 0);
  const expense = records.filter((r) => r.type === 'expense').reduce((sum, r) => sum + Number(r.amount), 0);
  const net = income - expense;
  res.json({ income, expense, net, totalTransactions: records.length });
});

router.get('/categories', requireRole('admin', 'analyst', 'viewer'), (req, res) => {
  const records = getRecords();
  const categoryTotals = {};
  records.forEach((r) => {
    const key = `${r.category}:${r.type}`;
    categoryTotals[key] = (categoryTotals[key] || 0) + Number(r.amount);
  });
  const output = Object.entries(categoryTotals).map(([k, v]) => {
    const [category, type] = k.split(':');
    return { category, type, total: v };
  });
  res.json(output);
});

router.get('/trends', requireRole('admin', 'analyst', 'viewer'), (req, res) => {
  const interval = req.query.interval === 'weekly' ? 'weekly' : 'monthly';
  const records = getRecords();
  const result = {};

  records.forEach((r) => {
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) return;
    let key;
    if (interval === 'weekly') {
      const year = d.getUTCFullYear();
      const week = Math.floor((d.getUTCDate() - 1) / 7) + 1;
      key = `${year}-W${String(week).padStart(2, '0')}`;
    } else {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      key = `${year}-${month}`;
    }
    if (!result[key]) result[key] = { income: 0, expense: 0, net: 0 };
    result[key][r.type] += Number(r.amount);
    result[key].net = result[key].income - result[key].expense;
  });

  const entries = Object.entries(result).map(([period, stats]) => ({ period, ...stats }));
  res.json(entries);
});

router.get('/recent', requireRole('admin', 'analyst', 'viewer'), (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const records = getRecords().sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(records.slice(0, limit));
});

module.exports = router;
