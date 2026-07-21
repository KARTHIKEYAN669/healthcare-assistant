const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const { getDb, getAll, runQuery } = require('../database');

// Get health vitals history
router.get('/vitals', auth, async (req, res) => {
  await getDb();
  const vitals = getAll(
    'SELECT * FROM health_vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 30',
    [req.user.id]
  );
  res.json(vitals);
});

// Log new vitals
router.post('/vitals', auth, async (req, res) => {
  await getDb();
  const { weight, height, blood_pressure, heart_rate, blood_sugar, temperature, oxygen_saturation } = req.body;
  const id = uuidv4();
  runQuery(
    'INSERT INTO health_vitals (id, patient_id, weight, height, blood_pressure, heart_rate, blood_sugar, temperature, oxygen_saturation) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, req.user.id, weight || null, height || null, blood_pressure || '', heart_rate || null, blood_sugar || null, temperature || null, oxygen_saturation || null]
  );
  res.status(201).json({ id, message: 'Vitals logged successfully' });
});

// Get doctor's patients (doctor only)
router.get('/my-patients', auth, async (req, res) => {
  await getDb();
  if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Doctor access required' });
  const patients = getAll(
    `SELECT DISTINCT u.id, u.name, u.email, u.phone, pp.blood_group, pp.dob, pp.chronic_conditions
     FROM appointments a JOIN users u ON a.patient_id = u.id
     LEFT JOIN patient_profiles pp ON u.id = pp.user_id
     WHERE a.doctor_id = ? ORDER BY u.name`,
    [req.user.id]
  );
  res.json(patients);
});

// Get patient medical history for doctor
router.get('/patient-history/:patientId', auth, async (req, res) => {
  await getDb();
  if (req.user.role !== 'doctor') return res.status(403).json({ error: 'Doctor access required' });
  const appointments = getAll('SELECT * FROM appointments WHERE patient_id = ? AND doctor_id = ? ORDER BY date DESC', [req.params.patientId, req.user.id]);
  const prescriptions = getAll('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC', [req.params.patientId]);
  const vitals = getAll('SELECT * FROM health_vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 10', [req.params.patientId]);
  res.json({ appointments, prescriptions, vitals });
});

module.exports = router;
