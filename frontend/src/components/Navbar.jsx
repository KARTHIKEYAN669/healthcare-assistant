import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Menu, Bell, Search, Phone } from 'lucide-react';

const pageTitles = {
  '/dashboard': 'Dashboard', '/profile': 'My Profile', '/symptoms': 'Symptoms Input',
  '/ai-assistant': 'AI Health Assistant', '/doctors': 'Find Doctors',
  '/appointments': 'My Appointments', '/prescriptions': 'Prescriptions',
  '/reminders': 'Medicine Reminders', '/reports': 'Medical Reports',
  '/health-tracking': 'Health Tracking', '/emergency': 'Emergency SOS',
  '/doctor': 'Doctor Dashboard', '/doctor/patients': 'My Patients',
  '/doctor/appointments': 'Appointments', '/doctor/prescriptions': 'Prescriptions',
};

export default function Navbar() {
  const { user } = useAuth();
  const { setSidebarOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'HealthCare';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0,
      height: 'var(--navbar-height)', background: 'rgba(5,11,26,0.9)',
      backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 24px',
      justifyContent: 'space-between', zIndex: 100,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          style={{ background:'none',border:'none',color:'var(--text-secondary)',cursor:'pointer',display:'none',padding:4 }}
          className="menu-btn"
        >
          <Menu size={22}/>
        </button>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>{title}</h1>
          <p style={{ fontSize:11, color:'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {/* Emergency button */}
        <button
          onClick={() => navigate('/emergency')}
          style={{
            display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
            borderRadius:'var(--radius-full)', background:'rgba(239,68,68,0.15)',
            border:'1px solid rgba(239,68,68,0.3)', color:'var(--red)',
            cursor:'pointer', fontSize:13, fontWeight:600,
            animation: 'none', transition:'var(--transition)',
          }}
        >
          <Phone size={14}/> SOS
        </button>

        {/* User avatar */}
        <div className="avatar" style={{ width:38, height:38, fontSize:14, cursor:'pointer' }}
          onClick={() => navigate(user?.role === 'doctor' ? '/doctor' : '/profile')}>
          {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          header { left: 0 !important; }
          .menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
