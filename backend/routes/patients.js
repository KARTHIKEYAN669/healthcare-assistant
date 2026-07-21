const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const { getDb, getOne, getAll, runQuery } = require('../database');

// Get patient profile
router.get('/profile', auth, async (req, res) => {
  await getDb();
  const user = getOne('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
  const profile = getOne('SELECT * FROM patient_profiles WHERE user_id = ?', [req.user.id]);
  res.json({ ...user, profile: profile || {} });
});

// Update patient profile
router.put('/profile', auth, async (req, res) => {
  await getDb();
  const { name, phone, dob, gender, blood_group, allergies, chronic_conditions, emergency_contact, emergency_phone, address } = req.body;

  runQuery('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name || req.user.name, phone || '', req.user.id]);

  const existing = getOne('SELECT id FROM patient_profiles WHERE user_id = ?', [req.user.id]);
  if (existing) {
    runQuery(
      'UPDATE patient_profiles SET dob=?, gender=?, blood_group=?, allergies=?, chronic_conditions=?, emergency_contact=?, emergency_phone=?, address=? WHERE user_id=?',
      [dob, gender, blood_group, allergies, chronic_conditions, emergency_contact, emergency_phone, address, req.user.id]
    );
  } else {
    runQuery(
      'INSERT INTO patient_profiles (id, user_id, dob, gender, blood_group, allergies, chronic_conditions, emergency_contact, emergency_phone, address) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [uuidv4(), req.user.id, dob, gender, blood_group, allergies, chronic_conditions, emergency_contact, emergency_phone, address]
    );
  }
  res.json({ message: 'Profile updated successfully' });
});

// Get dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  await getDb();
  const appointments = getAll('SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC LIMIT 5', [req.user.id]);
  const prescriptions = getAll('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY created_at DESC LIMIT 3', [req.user.id]);
  const reminders = getAll('SELECT * FROM medicine_reminders WHERE patient_id = ? AND active = 1', [req.user.id]);
  const vitals = getOne('SELECT * FROM health_vitals WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1', [req.user.id]);
  const totalAppointments = getOne('SELECT COUNT(*) as count FROM appointments WHERE patient_id = ?', [req.user.id]);
  const pendingCount = getOne("SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND status = 'pending'", [req.user.id]);

  res.json({
    recentAppointments: appointments,
    recentPrescriptions: prescriptions,
    activeReminders: reminders,
    latestVitals: vitals,
    stats: {
      totalAppointments: totalAppointments?.count || 0,
      pendingAppointments: pendingCount?.count || 0,
      activeMedications: reminders.length,
      prescriptions: prescriptions.length
    }
  });
});

module.exports = router;
