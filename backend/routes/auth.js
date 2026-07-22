const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb, getOne, getAll, runQuery } = require('../database');

// Register
router.post('/register', async (req, res) => {
  try {
    await getDb();
    const { name, email, password, role = 'patient', phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const existing = getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    runQuery('INSERT INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, hashed, role, phone || '']);

    // Create empty profile
    const profileId = uuidv4();
    if (role === 'patient') {
      runQuery('INSERT INTO patient_profiles (id, user_id) VALUES (?, ?)', [profileId, id]);
    }

    const token = jwt.sign({ id, name, email, role }, process.env.JWT_SECRET || 'healthcare_secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email, role, phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    await getDb();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = getOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'healthcare_secret',
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').auth, (req, res) => {
  const user = getOne('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// TEMPORARY DEBUG ROUTE
router.get('/debug-users', (req, res) => {
  try {
    const users = getAll('SELECT id, name, email, role FROM users');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
