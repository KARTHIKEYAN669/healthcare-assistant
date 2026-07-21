const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth, doctorOnly } = require('../middleware/auth');
const { getDb, getOne, getAll, runQuery } = require('../database');

// Get prescriptions (patient sees own, doctor sees all they wrote)
router.get('/', auth, async (req, res) => {
  await getDb();
  let rows;
  if (req.user.role === 'doctor') {
    rows = getAll(
      `SELECT p.*, u.name as patient_name, doc.name as doctor_name
       FROM prescriptions p JOIN users u ON p.patient_id = u.id JOIN users doc ON p.doctor_id = doc.id
       WHERE p.doctor_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
  } else {
    rows = getAll(
      `SELECT p.*, u.name as patient_name, doc.name as doctor_name, dp.specialty
       FROM prescriptions p JOIN users u ON p.patient_id = u.id JOIN users doc ON p.doctor_id = doc.id
       JOIN doctor_profiles dp ON doc.id = dp.user_id
       WHERE p.patient_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
  }
  res.json(rows);
});

// Create prescription (doctor only)
router.post('/', auth, doctorOnly, async (req, res) => {
  await getDb();
  const { patient_id, appointment_id, diagnosis, medicines, instructions, follow_up } = req.body;
  if (!patient_id || !diagnosis) return res.status(400).json({ error: 'Patient and diagnosis required' });

  const id = uuidv4();
  const medicinesJson = JSON.stringify(medicines || []);
  runQuery(
    'INSERT INTO prescriptions (id, patient_id, doctor_id, appointment_id, diagnosis, medicines, instructions, follow_up) VALUES (?,?,?,?,?,?,?,?)',
    [id, patient_id, req.user.id, appointment_id || null, diagnosis, medicinesJson, instructions || '', follow_up || '']
  );

  if (appointment_id) {
    runQuery("UPDATE appointments SET status = 'completed' WHERE id = ?", [appointment_id]);
  }

  const prescription = getOne('SELECT * FROM prescriptions WHERE id = ?', [id]);
  res.status(201).json(prescription);
});

// Get single prescription
router.get('/:id', auth, async (req, res) => {
  await getDb();
  const p = getOne(
    `SELECT p.*, u.name as patient_name, doc.name as doctor_name, dp.specialty, dp.hospital
     FROM prescriptions p JOIN users u ON p.patient_id = u.id JOIN users doc ON p.doctor_id = doc.id
     JOIN doctor_profiles dp ON doc.id = dp.user_id WHERE p.id = ?`,
    [req.params.id]
  );
  if (!p) return res.status(404).json({ error: 'Prescription not found' });
  if (p.medicines) p.medicines = JSON.parse(p.medicines);
  res.json(p);
});

module.exports = router;
