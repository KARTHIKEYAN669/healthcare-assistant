const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'healthcare.db');
let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function runQuery(sql, params = []) {
  db.run(sql, params);
  saveDb();
}

function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function getOne(sql, params = []) {
  const rows = getAll(sql, params);
  return rows[0] || null;
}

async function initDatabase() {
  await getDb();

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'patient',
    phone TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS patient_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    dob TEXT,
    gender TEXT,
    blood_group TEXT,
    allergies TEXT,
    chronic_conditions TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    address TEXT,
    avatar TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS doctor_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    specialty TEXT,
    qualification TEXT,
    experience INTEGER DEFAULT 0,
    rating REAL DEFAULT 4.5,
    hospital TEXT,
    fee INTEGER DEFAULT 500,
    available_days TEXT DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    avatar TEXT,
    bio TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(patient_id) REFERENCES users(id),
    FOREIGN KEY(doctor_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    appointment_id TEXT,
    diagnosis TEXT,
    medicines TEXT,
    instructions TEXT,
    follow_up TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(patient_id) REFERENCES users(id),
    FOREIGN KEY(doctor_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medicine_reminders (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    times TEXT,
    start_date TEXT,
    end_date TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(patient_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS medical_reports (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT,
    file_path TEXT,
    ai_summary TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(patient_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS health_vitals (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    weight REAL,
    height REAL,
    blood_pressure TEXT,
    heart_rate INTEGER,
    blood_sugar REAL,
    temperature REAL,
    oxygen_saturation REAL,
    recorded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(patient_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    messages TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(patient_id) REFERENCES users(id)
  )`);

  saveDb();

  // Seed doctors if none exist
  const doctorCount = getOne('SELECT COUNT(*) as count FROM users WHERE role = ?', ['doctor']);
  if (!doctorCount || doctorCount.count === 0) {
    await seedDoctors();
  }

  console.log('✅ Database initialized');
}

async function seedDoctors() {
  const { v4: uuidv4 } = require('uuid');
  const hashedPassword = await bcrypt.hash('doctor123', 10);

  const doctors = [
    { name: 'Dr. Priya Sharma', specialty: 'Cardiologist', qualification: 'MBBS, MD (Cardiology)', experience: 12, hospital: 'Apollo Hospital', fee: 800, rating: 4.9, bio: 'Expert in heart diseases and cardiac interventions with 12 years of experience.' },
    { name: 'Dr. Rahul Mehta', specialty: 'Neurologist', qualification: 'MBBS, DM (Neurology)', experience: 10, hospital: 'Fortis Healthcare', fee: 900, rating: 4.8, bio: 'Specialist in brain, spine, and nervous system disorders.' },
    { name: 'Dr. Ananya Reddy', specialty: 'General Physician', qualification: 'MBBS, MD (Internal Medicine)', experience: 8, hospital: 'Max Hospital', fee: 500, rating: 4.7, bio: 'Experienced in diagnosing and treating a wide range of illnesses.' },
    { name: 'Dr. Vikram Nair', specialty: 'Orthopedic', qualification: 'MBBS, MS (Ortho)', experience: 15, hospital: 'AIIMS Delhi', fee: 1000, rating: 4.9, bio: 'Bone and joint specialist with expertise in minimally invasive surgery.' },
    { name: 'Dr. Sonia Gupta', specialty: 'Pediatrician', qualification: 'MBBS, MD (Pediatrics)', experience: 9, hospital: 'Rainbow Children Hospital', fee: 600, rating: 4.8, bio: 'Caring for children from newborns to teenagers with compassion.' },
    { name: 'Dr. Arjun Patel', specialty: 'Dermatologist', qualification: 'MBBS, DVD', experience: 7, hospital: 'Skin & Hair Clinic', fee: 700, rating: 4.6, bio: 'Specialist in skin, hair, and nail conditions including cosmetic dermatology.' },
    { name: 'Dr. Meera Joshi', specialty: 'Gynecologist', qualification: 'MBBS, MS (OBG)', experience: 14, hospital: 'Motherhood Hospital', fee: 850, rating: 4.9, bio: 'Expert in women\'s reproductive health and high-risk pregnancies.' },
    { name: 'Dr. Suresh Kumar', specialty: 'Psychiatrist', qualification: 'MBBS, MD (Psychiatry)', experience: 11, hospital: 'NIMHANS', fee: 750, rating: 4.7, bio: 'Mental health specialist providing compassionate care for all psychiatric conditions.' },
    { name: 'Dr. Deepa Iyer', specialty: 'Endocrinologist', qualification: 'MBBS, DM (Endocrinology)', experience: 10, hospital: 'Narayana Health', fee: 900, rating: 4.8, bio: 'Diabetes and hormone disorders specialist with a patient-first approach.' },
    { name: 'Dr. Kiran Bhatt', specialty: 'Pulmonologist', qualification: 'MBBS, MD (Pulmonology)', experience: 8, hospital: 'Lung Care Center', fee: 800, rating: 4.6, bio: 'Specialist in respiratory diseases including asthma and COPD.' },
    { name: 'Dr. Neha Saxena', specialty: 'Ophthalmologist', qualification: 'MBBS, MS (Ophthalmology)', experience: 6, hospital: 'Sharp Eye Hospital', fee: 600, rating: 4.7, bio: 'Eye specialist with expertise in cataract surgery and refractive corrections.' },
    { name: 'Dr. Anil Chopra', specialty: 'ENT Specialist', qualification: 'MBBS, MS (ENT)', experience: 13, hospital: 'HearWell Clinic', fee: 650, rating: 4.8, bio: 'Ear, Nose, and Throat specialist with extensive surgical experience.' },
  ];

  const { v4: uuid } = require('uuid');
  for (const doc of doctors) {
    const userId = uuid();
    const docId = uuid();
    const email = `${doc.name.toLowerCase().replace(/[^a-z]/g, '.')}@healthcare.com`;
    db.run(
      'INSERT OR IGNORE INTO users (id, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, doc.name, email, hashedPassword, 'doctor', '+91-9876543210']
    );
    db.run(
      'INSERT OR IGNORE INTO doctor_profiles (id, user_id, specialty, qualification, experience, hospital, fee, rating, bio, available_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [docId, userId, doc.specialty, doc.qualification, doc.experience, doc.hospital, doc.fee, doc.rating, doc.bio, 'Mon,Tue,Wed,Thu,Fri']
    );
  }
  saveDb();
  console.log('🌱 Seeded 12 doctors');
}

module.exports = { initDatabase, getDb, saveDb, runQuery, getAll, getOne };
