const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const { getDb, getAll, getOne, runQuery } = require('../database');

// Get all reports
router.get('/', auth, async (req, res) => {
  await getDb();
  const reports = getAll(
    'SELECT * FROM medical_reports WHERE patient_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(reports);
});

// Upload / create report
router.post('/', auth, async (req, res) => {
  await getDb();
  const { title, type, notes } = req.body;
  if (!title) return res.status(400).json({ error: 'Report title required' });

  // Mock AI summary based on report type
  const aiSummaries = {
    'Blood Test': 'AI Analysis: The blood test report shows parameters within normal range. Hemoglobin levels appear adequate. No significant abnormalities detected. Follow up recommended in 3 months.',
    'X-Ray': 'AI Analysis: X-ray imaging reviewed. Bone density and structure appear normal. No fractures or lesions observed. Lung fields clear if chest X-ray.',
    'MRI': 'AI Analysis: MRI scan reviewed. No significant structural abnormalities detected. Soft tissue structures appear intact. Recommend clinical correlation.',
    'CT Scan': 'AI Analysis: CT scan parameters reviewed. No acute intracranial abnormalities. Parenchymal structures appear normal. Recommend follow-up as clinically indicated.',
    'ECG': 'AI Analysis: ECG tracing reviewed. Normal sinus rhythm observed. No significant ST-T wave changes. Heart rate within normal range.',
    'Urine Test': 'AI Analysis: Urinalysis results reviewed. No significant proteinuria or hematuria detected. Culture sensitivity pending. Hydration appears adequate.',
  };

  const ai_summary = aiSummaries[type] || 'AI Analysis: Report received and logged. Please consult your healthcare provider for detailed interpretation of this report.';
  const id = uuidv4();
  runQuery(
    'INSERT INTO medical_reports (id, patient_id, title, type, ai_summary, notes) VALUES (?,?,?,?,?,?)',
    [id, req.user.id, title, type || 'Other', ai_summary, notes || '']
  );
  const report = getOne('SELECT * FROM medical_reports WHERE id = ?', [id]);
  res.status(201).json(report);
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  await getDb();
  runQuery('DELETE FROM medical_reports WHERE id = ? AND patient_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Report deleted' });
});

module.exports = router;
