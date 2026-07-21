import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../api/api';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, MapPin, XCircle, Plus } from 'lucide-react';

export default function MyAppointments() {
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

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      showSuccess('Appointment cancelled');
      load();
    } catch { showError('Failed to cancel'); }
  };

  const filtered = appointments.filter(a => filter==='all' || a.status===filter);
  const tabs = ['all','pending','confirmed','completed','cancelled'];

  return (
    <div className="page animate-slide-up">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 className="page-title">My Appointments</h2>
          <p className="page-subtitle">Track and manage your medical appointments</p>
        </div>
        <button onClick={() => navigate('/doctors')} className="btn btn-primary">
          <Plus size={16}/> Book Appointment
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`tag ${filter===t ? 'tag-selected' : ''}`} style={{ textTransform:'capitalize' }}>
            {t} {t==='all' ? `(${appointments.length})` : `(${appointments.filter(a=>a.status===t).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner"/><p>Loading appointments...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} className="empty-icon"/>
          <div className="empty-title">No appointments found</div>
          <div className="empty-desc">Book an appointment with one of our doctors</div>
          <button onClick={() => navigate('/doctors')} className="btn btn-primary" style={{ marginTop:12 }}>Find Doctors</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map(a => (
            <div key={a.id} className="glass-card" style={{ padding:20 }}>
              <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                {/* Date box */}
                <div style={{ width:56, height:60, borderRadius:'var(--radius-md)', background:'var(--cyan-glow)', border:'1px solid rgba(0,212,255,0.2)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ fontSize:20, fontWeight:800, color:'var(--cyan)', lineHeight:1 }}>
                    {a.date ? new Date(a.date).getDate() : '--'}
                  </div>
                  <div style={{ fontSize:10, color:'var(--cyan)', fontWeight:600 }}>
                    {a.date ? new Date(a.date).toLocaleDateString('en',{month:'short'}).toUpperCase() : ''}
                  </div>
                </div>

                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                    <span style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>
                      Dr. {a.doctor_name || 'Unknown'}
                    </span>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>
                  <div style={{ fontSize:13, color:'var(--cyan)', marginBottom:8 }}>{a.specialty}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
                    <span style={{ fontSize:12, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5 }}>
                      <Clock size={12}/>{a.time_slot}
                    </span>
                    {a.hospital && (
                      <span style={{ fontSize:12, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5 }}>
                        <MapPin size={12}/>{a.hospital}
                      </span>
                    )}
                  </div>
                  {a.reason && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8, fontStyle:'italic' }}>Reason: {a.reason}</p>}
                </div>

                {['pending','confirmed'].includes(a.status) && (
                  <button onClick={() => cancel(a.id)} className="btn btn-ghost btn-sm" style={{ color:'var(--red)' }}>
                    <XCircle size={14}/> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
