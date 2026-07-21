import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, healthAPI } from '../../api/api';
import { Calendar, Users, CheckCircle, Clock, FileText, ArrowRight } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentAPI.getAll(),
      healthAPI.getMyPatients(),
    ]).then(([aRes, pRes]) => {
      setAppointments(aRes.data);
      setPatients(pRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const pending = appointments.filter(a => a.status === 'pending');
  const completed = appointments.filter(a => a.status === 'completed');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label:"Today's Appointments", value: todayAppts.length, color:'var(--cyan)', bg:'var(--cyan-glow)', icon:<Calendar size={22}/> },
    { label:'Pending', value: pending.length, color:'var(--amber)', bg:'var(--amber-glow)', icon:<Clock size={22}/> },
    { label:'Total Patients', value: patients.length, color:'var(--emerald)', bg:'var(--emerald-glow)', icon:<Users size={22}/> },
    { label:'Completed', value: completed.length, color:'var(--purple-light)', bg:'var(--purple-glow)', icon:<CheckCircle size={22}/> },
  ];

  return (
    <div className="page animate-slide-up">
      {/* Greeting */}
      <div style={{ padding:'28px 32px', borderRadius:'var(--radius-xl)', marginBottom:28, background:'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.08) 100%)', border:'1px solid rgba(0,212,255,0.15)' }}>
        <p style={{ color:'var(--cyan)', fontSize:13, fontWeight:600, marginBottom:6 }}>{greeting}, Doctor 👨‍⚕️</p>
        <h2 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', marginBottom:8 }}>{user?.name}</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:14 }}>
          {todayAppts.length > 0 ? `You have ${todayAppts.length} appointment${todayAppts.length>1?'s':''} scheduled today.` : 'No appointments scheduled for today.'}
        </p>
        <div style={{ display:'flex', gap:12, marginTop:16 }}>
          <button onClick={() => navigate('/doctor/appointments')} className="btn btn-primary">
            <Calendar size={16}/> View Schedule
          </button>
          <button onClick={() => navigate('/doctor/patients')} className="btn btn-secondary">
            <Users size={16}/> My Patients
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background:s.bg, color:s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <div className="glass-card" style={{ padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>
            <Calendar size={16} style={{ display:'inline', marginRight:8, color:'var(--cyan)' }}/>
            Today's Schedule
          </h3>
          <Link to="/doctor/appointments" style={{ color:'var(--cyan)', fontSize:12, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
            View all <ArrowRight size={12}/>
          </Link>
        </div>
        {loading ? (
          <div className="loading-page" style={{ minHeight:100 }}><div className="spinner"/></div>
        ) : todayAppts.length === 0 ? (
          <div className="empty-state" style={{ padding:'30px 0' }}>
            <Calendar size={36} className="empty-icon"/>
            <p className="empty-desc">No appointments today</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {todayAppts.map(a => (
              <div key={a.id} style={{ display:'flex', gap:14, alignItems:'center', padding:'14px 16px', borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'var(--cyan-glow)', color:'var(--cyan)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, flexShrink:0 }}>
                  {a.time_slot?.replace(':00','').replace(' ','').toLowerCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{a.patient_name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{a.reason || 'General consultation'}</div>
                </div>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
                <button onClick={() => navigate(`/doctor/consultation/${a.patient_id}`)} className="btn btn-secondary btn-sm">
                  <FileText size={13}/> Consult
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
