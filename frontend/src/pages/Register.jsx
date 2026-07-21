import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Heart, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { showError, showSuccess } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', role:'patient' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { showError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      showSuccess('Account created successfully! Welcome!');
      navigate(user.role === 'doctor' ? '/doctor' : '/dashboard');
    } catch (err) {
      showError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse at 70% 20%, #0d1f3c 0%, #050b1a 60%)',
      padding:'20px',
    }}>
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', bottom:0, left:0, pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:460 }} className="animate-slide-up">
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'var(--shadow-cyan)' }}>
            <Heart size={26} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)' }}>Create Account</h1>
          <p style={{ color:'var(--text-muted)', marginTop:6, fontSize:14 }}>Join AI HealthCare Assistant today</p>
        </div>

        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'28px', backdropFilter:'blur(20px)' }}>
          {/* Role toggle */}
          <div style={{ display:'flex', gap:8, marginBottom:20, background:'rgba(255,255,255,0.04)', padding:4, borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
            {['patient','doctor'].map(r => (
              <button key={r} onClick={() => setForm(f=>({...f,role:r}))}
                style={{
                  flex:1, padding:'8px', borderRadius:8, border:'none', cursor:'pointer',
                  fontWeight:600, fontSize:13, transition:'var(--transition)',
                  background: form.role === r ? 'var(--gradient-primary)' : 'transparent',
                  color: form.role === r ? '#fff' : 'var(--text-secondary)',
                }}>
                {r === 'doctor' ? '👨‍⚕️' : '🧑'} {r.charAt(0).toUpperCase()+r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position:'relative' }}>
                <User size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type="text" className="form-input" style={{ paddingLeft:38 }}
                  placeholder="Your full name" value={form.name}
                  onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type="email" className="form-input" style={{ paddingLeft:38 }}
                  placeholder="you@example.com" value={form.email}
                  onChange={e=>setForm(f=>({...f,email:e.target.value}))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position:'relative' }}>
                <Phone size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type="tel" className="form-input" style={{ paddingLeft:38 }}
                  placeholder="+91 9876543210" value={form.phone}
                  onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input type={showPass?'text':'password'} className="form-input" style={{ paddingLeft:38, paddingRight:38 }}
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={e=>setForm(f=>({...f,password:e.target.value}))} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop:8 }}>
              {loading ? <><div className="spinner" style={{width:18,height:18,borderWidth:2}}/> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--cyan)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
