const express = require('express');
const router = express.Router();
const { createRecord, getRecordById, updateRecord, deleteRecord, filterRecords } = require('../models');
const { requireRole } = require('../middlewares');

function validateRecordBody(req, res, next) {
  const { amount, type, category } = req.body;
  if (amount === undefined || type === undefined || !category) {
    return res.status(400).json({ error: 'amount,type,category are required' });
  }
  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ error: 'type must be income or expense' });
  }
  if (Number.isNaN(Number(amount))) {
    return res.status(400).json({ error: 'amount must be a number' });
  }
  next();
}

router.get('/', requireRole('admin', 'analyst', 'viewer'), (req, res) => {
  const { type, category, startDate, endDate } = req.query;
  const records = filterRecords({ type, category, startDate, endDate });
  res.json(records);
});

router.post('/', requireRole('admin'), validateRecordBody, (req, res) => {
  const record = createRecord({ ...req.body, createdBy: req.user.id });
  res.status(201).json(record);
});

router.get('/:id', requireRole('admin', 'analyst', 'viewer'), (req, res) => {
  const record = getRecordById(req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json(record);
});

router.put('/:id', requireRole('admin'), validateRecordBody, (req, res) => {
  const record = updateRecord(req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  res.json(record);
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const deleted = deleteRecord(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Record not found' });
  res.status(204).send();
});

module.exports = router;
