const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const { getDb, getAll, runQuery } = require('../database');

// Get all reminders
router.get('/', auth, async (req, res) => {
  await getDb();
  const reminders = getAll('SELECT * FROM medicine_reminders WHERE patient_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(reminders.map(r => ({ ...r, times: r.times ? r.times.split(',') : [] })));
});

// Create reminder
router.post('/', auth, async (req, res) => {
  await getDb();
  const { medicine_name, dosage, frequency, times, start_date, end_date } = req.body;
  if (!medicine_name) return res.status(400).json({ error: 'Medicine name is required' });
  const id = uuidv4();
  const timesStr = Array.isArray(times) ? times.join(',') : (times || '');
  runQuery(
    'INSERT INTO medicine_reminders (id, patient_id, medicine_name, dosage, frequency, times, start_date, end_date) VALUES (?,?,?,?,?,?,?,?)',
    [id, req.user.id, medicine_name, dosage || '', frequency || 'Once daily', timesStr, start_date || '', end_date || '']
  );
  res.status(201).json({ id, medicine_name, dosage, frequency, times: times || [] });
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  await getDb();
  const { medicine_name, dosage, frequency, times, start_date, end_date, active } = req.body;
  const timesStr = Array.isArray(times) ? times.join(',') : (times || '');
  runQuery(
    'UPDATE medicine_reminders SET medicine_name=?, dosage=?, frequency=?, times=?, start_date=?, end_date=?, active=? WHERE id=? AND patient_id=?',
    [medicine_name, dosage, frequency, timesStr, start_date, end_date, active !== undefined ? (active ? 1 : 0) : 1, req.params.id, req.user.id]
  );
  res.json({ message: 'Reminder updated' });
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  await getDb();
  runQuery('DELETE FROM medicine_reminders WHERE id = ? AND patient_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Reminder deleted' });
});

module.exports = router;
