const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getDb, getOne, getAll } = require('../database');

// Get all doctors
router.get('/', auth, async (req, res) => {
  await getDb();
  const { specialty } = req.query;
  let sql = `SELECT u.id, u.name, u.email, u.phone,
    d.specialty, d.qualification, d.experience, d.hospital, d.fee, d.rating, d.bio, d.available_days, d.avatar
    FROM users u JOIN doctor_profiles d ON u.id = d.user_id WHERE u.role = 'doctor'`;
  const params = [];
  if (specialty && specialty !== 'All') {
    sql += ' AND d.specialty = ?';
    params.push(specialty);
  }
  sql += ' ORDER BY d.rating DESC';
  const doctors = getAll(sql, params);
  res.json(doctors);
});

// Get single doctor
router.get('/:id', auth, async (req, res) => {
  await getDb();
  const doctor = getOne(
    `SELECT u.id, u.name, u.email, u.phone,
    d.specialty, d.qualification, d.experience, d.hospital, d.fee, d.rating, d.bio, d.available_days
    FROM users u JOIN doctor_profiles d ON u.id = d.user_id WHERE u.id = ?`,
    [req.params.id]
  );
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

// Get doctor specialties list
router.get('/meta/specialties', auth, async (req, res) => {
  await getDb();
  const rows = getAll('SELECT DISTINCT specialty FROM doctor_profiles ORDER BY specialty');
  res.json(rows.map(r => r.specialty));
});

module.exports = router;
