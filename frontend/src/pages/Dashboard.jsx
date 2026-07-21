import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientAPI } from '../api/api';
import {
  Calendar, FileText, Bell, Activity, Bot, Users,
  Stethoscope, ArrowRight, Heart, TrendingUp, Clock, CheckCircle
} from 'lucide-react';

const quickActions = [
  { icon: <Stethoscope size={22}/>, label:'Check Symptoms', to:'/symptoms', color:'#00d4ff', bg:'rgba(0,212,255,0.1)' },
  { icon: <Bot size={22}/>, label:'AI Assistant', to:'/ai-assistant', color:'#7c3aed', bg:'rgba(124,58,237,0.1)' },
  { icon: <Users size={22}/>, label:'Find Doctors', to:'/doctors', color:'#10b981', bg:'rgba(16,185,129,0.1)' },
  { icon: <Bell size={22}/>, label:'Reminders', to:'/reminders', color:'#f59e0b', bg:'rgba(245,158,11,0.1)' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: <Calendar size={22}/>, label:'Appointments', value: data?.stats?.totalAppointments || 0, color:'var(--cyan)', bg:'var(--cyan-glow)' },
    { icon: <Bell size={22}/>, label:'Medications', value: data?.stats?.activeMedications || 0, color:'var(--amber)', bg:'var(--amber-glow)' },
    { icon: <FileText size={22}/>, label:'Prescriptions', value: data?.stats?.prescriptions || 0, color:'var(--purple-light)', bg:'var(--purple-glow)' },
    { icon: <Clock size={22}/>, label:'Pending', value: data?.stats?.pendingAppointments || 0, color:'var(--red)', bg:'var(--red-glow)' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page animate-slide-up">
      {/* Hero greeting */}
      <div style={{
        padding:'28px 32px', borderRadius:'var(--radius-xl)', marginBottom:28,
        background:'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(124,58,237,0.08) 100%)',
        border:'1px solid rgba(0,212,255,0.15)', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-20, top:-20, opacity:0.05 }}>
          <Heart size={180} fill="currentColor" color="var(--cyan)" />
        </div>
        <p style={{ color:'var(--cyan)', fontSize:13, fontWeight:600, marginBottom:6 }}>{greeting} 👋</p>
        <h2 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', marginBottom:8 }}>
          {user?.name?.split(' ')[0] || 'User'}!
        </h2>
        <p style={{ color:'var(--text-secondary)', fontSize:14, maxWidth:400 }}>
          Your health dashboard is up to date. Stay on top of your wellness journey.
        </p>
        <div style={{ display:'flex', gap:12, marginTop:18, flexWrap:'wrap' }}>
          <button onClick={() => navigate('/symptoms')} className="btn btn-primary">
            <Stethoscope size={16}/> Check Symptoms
          </button>
          <button onClick={() => navigate('/ai-assistant')} className="btn btn-secondary">
            <Bot size={16}/> Ask AI
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

      <div className="grid-2" style={{ marginBottom:28 }}>
        {/* Quick actions */}
        <div className="glass-card" style={{ padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:18 }}>Quick Actions</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {quickActions.map(a => (
              <Link key={a.to} to={a.to} style={{
                display:'flex', flexDirection:'column', gap:10, padding:16, borderRadius:'var(--radius-md)',
                background:a.bg, border:`1px solid ${a.color}22`, textDecoration:'none',
                transition:'var(--transition)', cursor:'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='none'}
              >
                <span style={{ color:a.color }}>{a.icon}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent appointments */}
        <div className="glass-card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>Recent Appointments</h3>
            <Link to="/appointments" style={{ color:'var(--cyan)', fontSize:12, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              View all <ArrowRight size={12}/>
            </Link>
          </div>
          {loading ? (
            <div className="loading-page" style={{ minHeight:120 }}><div className="spinner"/></div>
          ) : data?.recentAppointments?.length ? (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {data.recentAppointments.slice(0,3).map(a => (
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'var(--cyan-glow)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--cyan)', flexShrink:0 }}>
                    <Calendar size={16}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      Dr. {a.doctor_name || 'Unknown'}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.date} • {a.time_slot}</div>
                  </div>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding:'30px 0' }}>
              <Calendar size={36} className="empty-icon"/>
              <p className="empty-desc">No appointments yet</p>
              <Link to="/doctors" className="btn btn-secondary btn-sm" style={{ marginTop:8 }}>Book Now</Link>
            </div>
          )}
        </div>
      </div>

      {/* Active medications */}
      {data?.activeReminders?.length > 0 && (
        <div className="glass-card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>
              <Bell size={16} style={{ display:'inline', marginRight:8, color:'var(--amber)' }}/>
              Active Medications
            </h3>
            <Link to="/reminders" style={{ color:'var(--cyan)', fontSize:12, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
              Manage <ArrowRight size={12}/>
            </Link>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {data.activeReminders.map(r => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:'var(--radius-full)', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--amber)', animation:'pulse 2s infinite' }}/>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{r.medicine_name}</span>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>{r.frequency}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
