import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Heart, Mail, Lock, Eye, EyeOff, Stethoscope } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { showError } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'patient' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'doctor' ? '/doctor' : '/dashboard');
    } catch (err) {
      showError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'patient') setForm({ email: 'demo@patient.com', password: 'demo123', role:'patient' });
    else setForm({ email: 'dr.priya.sharma@healthcare.com', password: 'doctor123', role:'doctor' });
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse at 30% 20%, #0d1f3c 0%, #050b1a 60%)',
      padding:'20px',
    }}>
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', top:0, right:0, pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:440 }} className="animate-slide-up">
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:60, height:60, borderRadius:16, background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'var(--shadow-cyan)' }}>
            <Heart size={28} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text-primary)' }}>Welcome Back</h1>
          <p style={{ color:'var(--text-muted)', marginTop:6, fontSize:14 }}>Sign in to your HealthCare account</p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'32px', backdropFilter:'blur(20px)' }}>
          {/* Role toggle */}
          <div style={{ display:'flex', gap:8, marginBottom:24, background:'rgba(255,255,255,0.04)', padding:4, borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
            {['patient','doctor'].map(r => (
              <button key={r} onClick={() => setForm(f=>({...f,role:r}))}
                style={{
                  flex:1, padding:'9px', borderRadius:8, border:'none', cursor:'pointer',
                  fontWeight:600, fontSize:13, transition:'var(--transition)',
                  background: form.role === r ? 'var(--gradient-primary)' : 'transparent',
                  color: form.role === r ? '#fff' : 'var(--text-secondary)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                }}>
                {r === 'doctor' ? <Stethoscope size={14}/> : <span>🧑</span>}
                {r.charAt(0).toUpperCase()+r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input
                  type="email" className="form-input" style={{ paddingLeft:38 }}
                  placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f=>({...f,email:e.target.value}))} required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input
                  type={showPass?'text':'password'} className="form-input" style={{ paddingLeft:38, paddingRight:38 }}
                  placeholder="Enter your password" value={form.password}
                  onChange={e => setForm(f=>({...f,password:e.target.value}))} required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop:8 }}>
              {loading ? <><div className="spinner" style={{width:18,height:18,borderWidth:2}}/> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop:20, padding:16, background:'rgba(0,212,255,0.05)', borderRadius:'var(--radius-md)', border:'1px solid rgba(0,212,255,0.1)' }}>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10, textAlign:'center' }}>🚀 Quick Demo Access</p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => fillDemo('patient')} className="btn btn-secondary btn-sm" style={{ flex:1, fontSize:12 }}>
                Patient Demo
              </button>
              <button onClick={() => fillDemo('doctor')} className="btn btn-secondary btn-sm" style={{ flex:1, fontSize:12 }}>
                Doctor Demo
              </button>
            </div>
          </div>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--cyan)', fontWeight:600, textDecoration:'none' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
