import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { prescriptionAPI } from '../../api/api';
import { ArrowLeft, Plus, Trash2, FileText, Check } from 'lucide-react';

const emptyMed = { name:'', dosage:'', frequency:'', duration:'' };

export default function CreatePrescription() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useApp();
  const [form, setForm] = useState({
    diagnosis:'', instructions:'', follow_up:'', medicines:[{ ...emptyMed }]
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const updateMed = (index, field, value) => {
    const meds = [...form.medicines];
    meds[index] = { ...meds[index], [field]: value };
    setForm(f => ({ ...f, medicines: meds }));
  };
  const addMed = () => setForm(f => ({ ...f, medicines: [...f.medicines, { ...emptyMed }] }));
  const removeMed = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_,idx)=>idx!==i) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis) { showError('Diagnosis is required'); return; }
    if (!form.medicines[0]?.name) { showError('At least one medicine is required'); return; }
    setSubmitting(true);
    try {
      await prescriptionAPI.create({ patient_id: patientId, ...form });
      showSuccess('Prescription created successfully!');
      setDone(true);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="page animate-slide-up" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--emerald-glow)', border:'2px solid var(--emerald)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--emerald)' }}>
          <Check size={40}/>
        </div>
        <h2 style={{ fontSize:24, fontWeight:800, color:'var(--text-primary)', marginBottom:8 }}>Prescription Created!</h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:24 }}>The digital prescription has been sent to the patient.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={() => navigate('/doctor/appointments')} className="btn btn-primary">View Appointments</button>
          <button onClick={() => { setDone(false); setForm({ diagnosis:'', instructions:'', follow_up:'', medicines:[{ ...emptyMed }] }); }} className="btn btn-secondary">New Prescription</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page animate-slide-up">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>
        <ArrowLeft size={16}/> Back
      </button>
      <h2 className="page-title" style={{ marginBottom:4 }}>Create Prescription</h2>
      <p className="page-subtitle" style={{ marginBottom:24 }}>Write a digital prescription for your patient</p>

      <form onSubmit={submit}>
        {/* Diagnosis */}
        <div className="glass-card" style={{ padding:24, marginBottom:20 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>Clinical Details</h3>
          <div className="form-group">
            <label className="form-label">Diagnosis *</label>
            <input className="form-input" value={form.diagnosis}
              onChange={e=>setForm(f=>({...f,diagnosis:e.target.value}))} placeholder="e.g., Viral Upper Respiratory Tract Infection" required />
          </div>
          <div className="form-group">
            <label className="form-label">Instructions to Patient</label>
            <textarea className="form-textarea" value={form.instructions}
              onChange={e=>setForm(f=>({...f,instructions:e.target.value}))}
              placeholder="e.g., Rest, drink plenty of fluids, avoid cold drinks..." />
          </div>
          <div className="form-group">
            <label className="form-label">Follow-up Date / Recommendation</label>
            <input className="form-input" value={form.follow_up}
              onChange={e=>setForm(f=>({...f,follow_up:e.target.value}))} placeholder="e.g., Review after 5 days" />
          </div>
        </div>

        {/* Medicines */}
        <div className="glass-card" style={{ padding:24, marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
              💊 Medicines
            </h3>
            <button type="button" onClick={addMed} className="btn btn-secondary btn-sm">
              <Plus size={14}/> Add Medicine
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {form.medicines.map((med, i) => (
              <div key={i} style={{ padding:18, borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', position:'relative' }}>
                <div style={{ position:'absolute', top:10, right:10 }}>
                  {form.medicines.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)} className="btn btn-ghost btn-sm" style={{ color:'var(--red)', padding:4 }}>
                      <Trash2 size={14}/>
                    </button>
                  )}
                </div>
                <div style={{ fontWeight:600, color:'var(--cyan)', fontSize:12, marginBottom:12 }}>Medicine #{i+1}</div>
                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Medicine Name *</label>
                    <input className="form-input" value={med.name}
                      onChange={e=>updateMed(i,'name',e.target.value)} placeholder="e.g., Paracetamol" />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Dosage</label>
                    <input className="form-input" value={med.dosage}
                      onChange={e=>updateMed(i,'dosage',e.target.value)} placeholder="e.g., 500mg" />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Frequency</label>
                    <input className="form-input" value={med.frequency}
                      onChange={e=>updateMed(i,'frequency',e.target.value)} placeholder="e.g., Twice daily after meals" />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Duration</label>
                    <input className="form-input" value={med.duration}
                      onChange={e=>updateMed(i,'duration',e.target.value)} placeholder="e.g., 5 days" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? <><div className="spinner" style={{width:18,height:18,borderWidth:2}}/> Creating...</> : <><FileText size={18}/> Issue Prescription</>}
        </button>
      </form>
    </div>
  );
}
