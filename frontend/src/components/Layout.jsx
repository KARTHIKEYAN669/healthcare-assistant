import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Stethoscope, Bot, Users, User } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  const mobileNavItems = user?.role === 'doctor' ? [
    { to: '/doctor', icon: <LayoutDashboard size={20}/>, label: 'Dashboard' },
    { to: '/doctor/appointments', icon: <Stethoscope size={20}/>, label: 'Appointments' },
    { to: '/doctor/patients', icon: <Users size={20}/>, label: 'Patients' },
    { to: '/profile', icon: <User size={20}/>, label: 'Profile' },
  ] : [
    { to: '/dashboard', icon: <LayoutDashboard size={20}/>, label: 'Home' },
    { to: '/symptoms', icon: <Stethoscope size={20}/>, label: 'Symptoms' },
    { to: '/ai-assistant', icon: <Bot size={20}/>, label: 'AI Chat' },
    { to: '/doctors', icon: <Users size={20}/>, label: 'Doctors' },
    { to: '/profile', icon: <User size={20}/>, label: 'Profile' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Outlet />
      </div>

      {/* Sleek Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {mobileNavItems.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">{item.icon}</div>
              <span className="mobile-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(60px + var(--safe-area-bottom));
          padding-bottom: var(--safe-area-bottom);
          background: rgba(8, 15, 34, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 999;
          justify-content: space-around;
          align-items: center;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
          }
        }
        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 11px;
          font-weight: 500;
          flex: 1;
          height: 100%;
          transition: all 0.2s ease;
        }
        .mobile-nav-item.active {
          color: #00d4ff;
        }
        .mobile-nav-item.active .mobile-nav-icon {
          transform: translateY(-2px);
          color: #00d4ff;
        }
      `}</style>
    </div>
  );
}
