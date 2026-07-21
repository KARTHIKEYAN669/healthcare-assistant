const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const { getDb, getOne, getAll, runQuery } = require('../database');

// Get all appointments for patient or doctor
router.get('/', auth, async (req, res) => {
  await getDb();
  let rows;
  if (req.user.role === 'doctor') {
    rows = getAll(
      `SELECT a.*, u.name as patient_name, u.email as patient_email
       FROM appointments a JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ? ORDER BY a.date DESC, a.time_slot ASC`,
      [req.user.id]
    );
  } else {
    rows = getAll(
      `SELECT a.*, u.name as doctor_name, dp.specialty, dp.hospital
       FROM appointments a JOIN users u ON a.doctor_id = u.id
       JOIN doctor_profiles dp ON u.id = dp.user_id
       WHERE a.patient_id = ? ORDER BY a.date DESC, a.time_slot ASC`,
      [req.user.id]
    );
  }
  res.json(rows);
});

// Book appointment
router.post('/', auth, async (req, res) => {
  await getDb();
  const { doctor_id, date, time_slot, reason } = req.body;
  if (!doctor_id || !date || !time_slot) return res.status(400).json({ error: 'Doctor, date and time are required' });

  // Check slot availability
  const existing = getOne(
    'SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ? AND status != ?',
    [doctor_id, date, time_slot, 'cancelled']
  );
  if (existing) return res.status(409).json({ error: 'This slot is already booked' });

  const id = uuidv4();
  runQuery(
    'INSERT INTO appointments (id, patient_id, doctor_id, date, time_slot, reason) VALUES (?, ?, ?, ?, ?, ?)',
    [id, req.user.id, doctor_id, date, time_slot, reason || '']
  );
  const appointment = getOne('SELECT * FROM appointments WHERE id = ?', [id]);
  res.status(201).json(appointment);
});

// Update appointment status
router.put('/:id', auth, async (req, res) => {
  await getDb();
  const { status, notes } = req.body;
  const appt = getOne('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  runQuery('UPDATE appointments SET status = ?, notes = ? WHERE id = ?', [status, notes || '', req.params.id]);
  res.json({ message: 'Appointment updated' });
});

// Cancel appointment
router.delete('/:id', auth, async (req, res) => {
  await getDb();
  runQuery("UPDATE appointments SET status = 'cancelled' WHERE id = ? AND patient_id = ?", [req.params.id, req.user.id]);
  res.json({ message: 'Appointment cancelled' });
});

// Get available time slots for a doctor on a date
router.get('/slots/:doctorId', auth, async (req, res) => {
  await getDb();
  const { date } = req.query;
  const allSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];
  const booked = getAll(
    "SELECT time_slot FROM appointments WHERE doctor_id = ? AND date = ? AND status != 'cancelled'",
    [req.params.doctorId, date]
  ).map(r => r.time_slot);
  const available = allSlots.filter(s => !booked.includes(s));
  res.json(available);
});

module.exports = router;
