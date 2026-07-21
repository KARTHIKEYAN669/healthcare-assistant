import { useState, useEffect } from 'react';
import { prescriptionAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Pill, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    prescriptionAPI.getAll().then(r => setPrescriptions(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const parseMeds = (meds) => {
    if (!meds) return [];
    if (typeof meds === 'string') { try { return JSON.parse(meds); } catch { return [{ name: meds }]; } }
    return meds;
  };

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Loading prescriptions...</p></div>;

  return (
    <div className="page animate-slide-up">
      <div className="page-header">
        <h2 className="page-title">Prescriptions</h2>
        <p className="page-subtitle">Your digital prescriptions from doctors</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-icon"/>
          <div className="empty-title">No prescriptions yet</div>
          <div className="empty-desc">Prescriptions from your doctors will appear here after consultations</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {prescriptions.map(p => {
            const meds = parseMeds(p.medicines);
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} className="glass-card" style={{ overflow:'hidden' }}>
                {/* Header */}
                <div style={{ padding:'18px 22px', display:'flex', gap:16, alignItems:'center', cursor:'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : p.id)}>
                  <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--purple-light)' }}>
                    <FileText size={20}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{p.diagnosis}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:4 }}>
                      <span style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                        <User size={11}/>{user?.role==='doctor' ? p.patient_name : `Dr. ${p.doctor_name}`}
                      </span>
                      <span style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                        <Calendar size={11}/>{new Date(p.created_at).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize:12, color:'var(--cyan)' }}>{p.specialty}</span>
                    </div>
                  </div>
                  <div style={{ color:'var(--text-muted)' }}>
                    {isOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ borderTop:'1px solid var(--border)', padding:'20px 22px', display:'flex', flexDirection:'column', gap:20 }}>
                    {/* Medicines */}
                    {meds.length > 0 && (
                      <div>
                        <h4 style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>Prescribed Medicines</h4>
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                          {meds.map((med, i) => (
                            <div key={i} style={{ display:'flex', gap:12, padding:'12px 14px', borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                              <Pill size={18} color="var(--amber)" style={{ flexShrink:0, marginTop:1 }}/>
                              <div>
                                <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{med.name || med}</div>
                                {med.dosage && <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Dosage: {med.dosage}</div>}
                                {med.frequency && <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Frequency: {med.frequency}</div>}
                                {med.duration && <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Duration: {med.duration}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {p.instructions && (
                      <div>
                        <h4 style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Instructions</h4>
                        <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{p.instructions}</p>
                      </div>
                    )}

                    {p.follow_up && (
                      <div style={{ padding:'12px 14px', borderRadius:'var(--radius-md)', background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)' }}>
                        <span style={{ fontSize:13, color:'var(--cyan)', fontWeight:600 }}>🗓 Follow-up: </span>
                        <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{p.follow_up}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
