import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { aiAPI } from '../api/api';
import { Stethoscope, ArrowRight, AlertTriangle, Loader } from 'lucide-react';

const commonSymptoms = [
  'Fever','Headache','Cough','Sore Throat','Runny Nose','Fatigue','Body Ache',
  'Chest Pain','Shortness of Breath','Nausea','Vomiting','Diarrhea','Stomach Pain',
  'Dizziness','Joint Pain','Back Pain','Skin Rash','Itching','Loss of Appetite',
  'Insomnia','Anxiety','High Blood Pressure','Swelling','Eye Pain',
];

export default function Symptoms() {
  const { showError } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = (s) => setSelected(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  const allSymptoms = [...selected];
  if (custom.trim()) allSymptoms.push(...custom.split(',').map(s=>s.trim()).filter(Boolean));

  const analyze = async () => {
    if (!allSymptoms.length) { showError('Please select or enter at least one symptom'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.analyzeSymptoms(allSymptoms);
      setResult(res.data);
    } catch (err) {
      showError('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page animate-slide-up">
      <div className="page-header">
        <h2 className="page-title">Symptoms Input</h2>
        <p className="page-subtitle">Select your symptoms for AI-powered health guidance</p>
      </div>

      {!result ? (
        <>
          {/* Symptom chips */}
          <div className="glass-card" style={{ padding:24, marginBottom:20 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>Select Symptoms</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>Tap to select all that apply</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {commonSymptoms.map(s => (
                <button key={s} onClick={() => toggle(s)}
                  className={`tag ${selected.includes(s) ? 'tag-selected' : ''}`}
                  style={{ fontSize:13, padding:'7px 14px' }}>
                  {selected.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
          </div>

          {/* Additional input */}
          <div className="glass-card" style={{ padding:24, marginBottom:20 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:14 }}>Additional Details</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Other Symptoms</label>
                <input className="form-input" value={custom}
                  onChange={e=>setCustom(e.target.value)} placeholder="e.g., blurred vision, loss of taste..." />
              </div>
              <div className="form-group">
                <label className="form-label">How long?</label>
                <select className="form-select" value={duration} onChange={e=>setDuration(e.target.value)}>
                  <option value="">Select duration</option>
                  <option>Less than 24 hours</option><option>1–3 days</option>
                  <option>3–7 days</option><option>More than a week</option><option>More than a month</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-select" value={severity} onChange={e=>setSeverity(e.target.value)}>
                  <option value="">Select severity</option>
                  <option>Mild — bearable</option><option>Moderate — affecting daily activities</option>
                  <option>Severe — very uncomfortable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Selected summary */}
          {allSymptoms.length > 0 && (
            <div style={{ padding:16, borderRadius:'var(--radius-md)', background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)', marginBottom:20 }}>
              <p style={{ fontSize:13, color:'var(--cyan)', fontWeight:600, marginBottom:8 }}>
                {allSymptoms.length} symptom{allSymptoms.length>1?'s':''} selected:
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {allSymptoms.map(s => (
                  <span key={s} style={{ padding:'3px 10px', borderRadius:999, background:'rgba(0,212,255,0.1)', color:'var(--cyan)', fontSize:12, fontWeight:500 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <button onClick={analyze} className="btn btn-primary btn-lg" disabled={loading || !allSymptoms.length}>
            {loading ? <><Loader size={18} style={{ animation:'spin 1s linear infinite' }}/> Analyzing...</> : <><Stethoscope size={18}/> Analyze Symptoms</>}
          </button>
        </>
      ) : (
        /* Results */
        <div className="animate-slide-up">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, padding:'12px 16px', borderRadius:'var(--radius-md)', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={18} color="var(--amber)"/>
            <p style={{ fontSize:13, color:'var(--amber)', fontWeight:500 }}>
              This is AI-generated health information. Always consult a qualified healthcare professional.
            </p>
          </div>

          <div className="glass-card" style={{ padding:28, marginBottom:20 }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
              🤖 AI Health Analysis
            </h3>
            <div className="ai-response" style={{ color:'var(--text-secondary)', lineHeight:1.8 }}
              dangerouslySetInnerHTML={{ __html: result.analysis?.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>') }} />
          </div>

          {result.recommendedSpecialties?.length > 0 && (
            <div className="glass-card" style={{ padding:24, marginBottom:20 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:14 }}>Recommended Specialists</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {result.recommendedSpecialties.map(spec => (
                  <button key={spec} onClick={() => navigate(`/doctors?specialty=${spec}`)}
                    className="btn btn-secondary" style={{ fontSize:13 }}>
                    <Stethoscope size={14}/> {spec} <ArrowRight size={13}/>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:12 }}>
            <button onClick={() => setResult(null)} className="btn btn-secondary">← Back</button>
            <button onClick={() => navigate('/ai-assistant')} className="btn btn-primary">
              Chat with AI <ArrowRight size={16}/>
            </button>
            <button onClick={() => navigate('/doctors')} className="btn btn-success">
              Find Doctors <ArrowRight size={16}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
