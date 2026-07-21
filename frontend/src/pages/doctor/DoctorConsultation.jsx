import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { healthAPI } from '../../api/api';
import { ArrowLeft, Calendar, FileText, Activity, Pill } from 'lucide-react';

export default function DoctorConsultation() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    healthAPI.getPatientHistory(patientId).then(r => setHistory(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Loading patient history...</p></div>;

  const parseMeds = (meds) => {
    if (!meds) return [];
    try { return typeof meds === 'string' ? JSON.parse(meds) : meds; } catch { return []; }
  };

  return (
    <div className="page animate-slide-up">
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>
        <ArrowLeft size={16}/> Back
      </button>
      <h2 className="page-title" style={{ marginBottom:8 }}>Patient Consultation History</h2>
      <p className="page-subtitle" style={{ marginBottom:24 }}>Viewing patient medical records</p>

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Appointments history */}
        <div className="glass-card" style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <Calendar size={16} color="var(--cyan)"/> Appointment History
          </h3>
          {history?.appointments?.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>No appointments with this patient yet</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {history?.appointments?.map(a => (
                <div key={a.id} style={{ padding:'12px 14px', borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{a.date}</span>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{a.time_slot} {a.reason ? `• ${a.reason}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions */}
        <div className="glass-card" style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <FileText size={16} color="var(--purple-light)"/> Prescriptions Issued
          </h3>
          {history?.prescriptions?.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>No prescriptions issued to this patient</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {history?.prescriptions?.map(p => (
                <div key={p.id} style={{ padding:'12px 14px', borderRadius:'var(--radius-md)', background:'rgba(124,58,237,0.05)', border:'1px solid rgba(124,58,237,0.15)' }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{p.diagnosis}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{new Date(p.created_at).toLocaleDateString()}</div>
                  {parseMeds(p.medicines).slice(0,3).map((m,i) => (
                    <div key={i} style={{ fontSize:12, color:'var(--amber)', display:'flex', gap:6 }}>
                      <Pill size={11}/>{typeof m === 'string' ? m : m.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vitals */}
      {history?.vitals?.length > 0 && (
        <div className="glass-card" style={{ padding:24, marginTop:20 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <Activity size={16} color="var(--emerald)"/> Recent Vitals
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>HR (bpm)</th><th>BP</th><th>Sugar</th><th>Temp (°C)</th><th>SpO2 (%)</th><th>Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {history.vitals.map(v => (
                  <tr key={v.id}>
                    <td>{new Date(v.recorded_at).toLocaleDateString()}</td>
                    <td>{v.heart_rate || '—'}</td>
                    <td>{v.blood_pressure || '—'}</td>
                    <td>{v.blood_sugar || '—'}</td>
                    <td>{v.temperature || '—'}</td>
                    <td>{v.oxygen_saturation || '—'}</td>
                    <td>{v.weight || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop:20 }}>
        <button onClick={() => navigate(`/doctor/prescribe/${patientId}`)} className="btn btn-primary btn-lg">
          <FileText size={16}/> Create New Prescription
        </button>
      </div>
    </div>
  );
}
