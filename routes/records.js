const express = require('express');
const router = express.Router();
const { createRecord, getRecordById, updateRecord, deleteRecord, filterRecords } = require('../models');
const { requireRole } = require('../middlewares');

function validateRecordBody(req, res, next) {
  const { amount, type, category } = req.body;
  if (amount === undefined || type === undefined || !category) {
    return res.status(400).json({ error: 'amount,type,category are required' });
  }
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'type must be income or expense' });
  }
  if (Number.isNaN(Number(amount))) {
    return res.status(400).json({ error: 'amount must be a number' });
  }
  next();
}

router.get('/', requireRole('admin', 'analyst', 'viewer', 'owner'), async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    res.json(await filterRecords({ type, category, startDate, endDate }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole('admin'), validateRecordBody, async (req, res) => {
  try {
    const record = await createRecord({ ...req.body, createdBy: req.user.id });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireRole('admin', 'analyst', 'viewer', 'owner'), async (req, res) => {
  try {
    const record = await getRecordById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireRole('admin'), validateRecordBody, async (req, res) => {
  try {
    const record = await updateRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const deleted = await deleteRecord(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
