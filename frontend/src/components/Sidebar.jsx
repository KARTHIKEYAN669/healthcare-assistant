import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, User, Stethoscope, Bot, Users, Calendar,
  FileText, Bell, FolderHeart, Activity, Phone, LogOut,
  Heart, ChevronRight, X
} from 'lucide-react';

const patientNav = [
  { to: '/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
  { to: '/symptoms', icon: <Stethoscope size={18}/>, label: 'Symptoms' },
  { to: '/ai-assistant', icon: <Bot size={18}/>, label: 'AI Assistant' },
  { to: '/doctors', icon: <Users size={18}/>, label: 'Find Doctors' },
  { to: '/appointments', icon: <Calendar size={18}/>, label: 'Appointments' },
  { to: '/prescriptions', icon: <FileText size={18}/>, label: 'Prescriptions' },
  { to: '/reminders', icon: <Bell size={18}/>, label: 'Medicine Reminders' },
  { to: '/reports', icon: <FolderHeart size={18}/>, label: 'Medical Reports' },
  { to: '/health-tracking', icon: <Activity size={18}/>, label: 'Health Tracking' },
  { to: '/emergency', icon: <Phone size={18}/>, label: 'Emergency SOS', danger: true },
];

const doctorNav = [
  { to: '/doctor', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
  { to: '/doctor/appointments', icon: <Calendar size={18}/>, label: 'Appointments' },
  { to: '/doctor/patients', icon: <Users size={18}/>, label: 'My Patients' },
  { to: '/doctor/prescriptions', icon: <FileText size={18}/>, label: 'Prescriptions' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { showSuccess, sidebarOpen, setSidebarOpen } = useApp();
  const navigate = useNavigate();
  const navItems = user?.role === 'doctor' ? doctorNav : patientNav;
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'U';

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:198,backdropFilter:'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : undefined, bottom: 0,
        width: 'var(--sidebar-width)', background: '#080f22',
        borderRight: '1px solid var(--border)', display: 'flex',
        flexDirection: 'column', zIndex: 199, overflowY: 'auto',
        transform: window.innerWidth <= 768 ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Heart size={18} color="#fff" fill="#fff" />
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>HealthCare</div>
              <div style={{ fontSize:11, color:'var(--cyan)', fontWeight:600 }}>AI Assistant</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',display:'none' }} className="mobile-close">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className="avatar" style={{ width:42, height:42, fontSize:16 }}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize:11, color: user?.role === 'doctor' ? 'var(--cyan)' : 'var(--purple-light)', textTransform:'capitalize' }}>
                {user?.role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑 Patient'}
              </div>
            </div>
          </div>
          {user?.role === 'patient' && (
            <NavLink to="/profile" style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, padding:'6px 10px', borderRadius:8, background:'rgba(255,255,255,0.04)', textDecoration:'none', color:'var(--text-secondary)', fontSize:12, transition:'var(--transition)' }}>
              <User size={13}/> View Profile <ChevronRight size={12} style={{ marginLeft:'auto' }}/>
            </NavLink>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:'12px 12px', display:'flex', flexDirection:'column', gap:2 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', padding:'0 8px', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Menu
          </div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/doctor'}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                borderRadius:'var(--radius-md)', textDecoration:'none', fontSize:14,
                fontWeight: isActive ? 600 : 400, transition:'var(--transition)',
                color: item.danger ? 'var(--red)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? (item.danger ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,255,0.08)') : 'transparent',
                borderLeft: isActive ? `3px solid ${item.danger ? 'var(--red)' : 'var(--cyan)'}` : '3px solid transparent',
              })}
              onClick={() => setSidebarOpen(false)}
            >
              <span style={{ opacity: 0.85 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding:'12px', borderTop:'1px solid var(--border)' }}>
          <button onClick={handleLogout} className="btn btn-ghost w-full" style={{ justifyContent:'flex-start', gap:10, color:'var(--text-muted)' }}>
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
