import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../api/api';
import { useApp } from '../../context/AppContext';
import { Calendar, Check, X, FileText, Clock, User } from 'lucide-react';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    appointmentAPI.getAll().then(r => setAppointments(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.update(id, { status });
      showSuccess(`Appointment ${status}`);
      load();
    } catch { showError('Failed to update'); }
  };

  const tabs = ['all','pending','confirmed','completed','cancelled'];
  const filtered = appointments.filter(a => filter==='all' || a.status===filter);

  return (
    <div className="page animate-slide-up">
      <div className="page-header">
        <h2 className="page-title">Appointments</h2>
        <p className="page-subtitle">Manage all patient appointments</p>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`tag ${filter===t ? 'tag-selected' : ''}`} style={{ textTransform:'capitalize' }}>
            {t} ({t==='all' ? appointments.length : appointments.filter(a=>a.status===t).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} className="empty-icon"/>
          <div className="empty-title">No appointments</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map(a => (
            <div key={a.id} className="glass-card" style={{ padding:20 }}>
              <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ width:56, height:60, borderRadius:'var(--radius-md)', background:'var(--cyan-glow)', border:'1px solid rgba(0,212,255,0.2)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ fontSize:18, fontWeight:800, color:'var(--cyan)', lineHeight:1 }}>
                    {a.date ? new Date(a.date).getDate() : '--'}
                  </div>
                  <div style={{ fontSize:10, color:'var(--cyan)', fontWeight:600 }}>
                    {a.date ? new Date(a.date).toLocaleDateString('en',{month:'short'}).toUpperCase() : ''}
                  </div>
                </div>
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:4 }}>
                    <User size={14} color="var(--text-muted)"/>
                    <span style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{a.patient_name}</span>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:10 }}>
                    <span><Clock size={11} style={{ display:'inline', marginRight:3 }}/>{a.time_slot}</span>
                    {a.reason && <span>• {a.reason}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(a.id,'confirmed')} className="btn btn-success btn-sm">
                        <Check size={13}/> Confirm
                      </button>
                      <button onClick={() => updateStatus(a.id,'cancelled')} className="btn btn-danger btn-sm">
                        <X size={13}/> Cancel
                      </button>
                    </>
                  )}
                  {a.status === 'confirmed' && (
                    <button onClick={() => updateStatus(a.id,'completed')} className="btn btn-primary btn-sm">
                      <Check size={13}/> Complete
                    </button>
                  )}
                  <button onClick={() => navigate(`/doctor/prescribe/${a.patient_id}`)} className="btn btn-secondary btn-sm">
                    <FileText size={13}/> Prescribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
