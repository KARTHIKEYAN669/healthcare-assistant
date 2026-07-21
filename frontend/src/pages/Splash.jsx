import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope, Bot, Shield } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background: 'radial-gradient(ellipse at top, #0d1f3c 0%, #050b1a 60%)',
      overflow: 'hidden', position: 'relative', padding: '20px',
    }}>
      {/* Ambient orbs */}
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', top:'-100px', left:'-100px', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', bottom:'-50px', right:'-50px', pointerEvents:'none' }} />

      {/* Logo */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24, animation:'slideUp 0.8s ease forwards' }}>
        <div style={{
          width:90, height:90, borderRadius:24, background:'var(--gradient-primary)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 60px rgba(0,212,255,0.3), 0 0 120px rgba(124,58,237,0.15)',
          animation: 'pulse 2s ease infinite',
        }}>
          <Heart size={42} color="#fff" fill="#fff" />
        </div>

        <div style={{ textAlign:'center' }}>
          <h1 style={{ fontSize:40, fontWeight:900, letterSpacing:'-1px', lineHeight:1.1 }}>
            <span style={{ background:'var(--gradient-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              AI HealthCare
            </span>
          </h1>
          <p style={{ fontSize:16, color:'var(--text-secondary)', marginTop:8 }}>
            Your intelligent health companion
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
          {[
            { icon: <Bot size={14}/>, label:'AI Assistant' },
            { icon: <Stethoscope size={14}/>, label:'Find Doctors' },
            { icon: <Shield size={14}/>, label:'Secure Records' },
          ].map(f => (
            <div key={f.label} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'8px 16px', borderRadius:'var(--radius-full)',
              background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)',
              color:'var(--text-secondary)', fontSize:13, fontWeight:500,
            }}>
              <span style={{ color:'var(--cyan)' }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div style={{ marginTop:16, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <div style={{ width:200, height:2, background:'rgba(255,255,255,0.08)', borderRadius:1, overflow:'hidden' }}>
            <div style={{
              height:'100%', background:'var(--gradient-primary)', borderRadius:1,
              animation: 'loadProgress 3s ease forwards',
            }} />
          </div>
          <p style={{ fontSize:12, color:'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>

      <style>{`
        @keyframes loadProgress { from { width: 0; } to { width: 100%; } }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(0,212,255,0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 80px rgba(0,212,255,0.5); }
        }
      `}</style>
    </div>
  );
}
