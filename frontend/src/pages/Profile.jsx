import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { patientAPI } from '../api/api';
import { User, Phone, MapPin, Droplets, Heart, AlertCircle, Save, Edit } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showSuccess, showError } = useApp();
  const [profile, setProfile] = useState({
    name: user?.name || '', phone: user?.phone || '', dob: '', gender: '',
    blood_group: '', allergies: '', chronic_conditions: '',
    emergency_contact: '', emergency_phone: '', address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    patientAPI.getProfile().then(r => {
      const { profile: p, ...u } = r.data;
      setProfile(prev => ({ ...prev, name: u.name||'', phone: u.phone||'', ...p }));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientAPI.updateProfile(profile);
      const stored = JSON.parse(localStorage.getItem('hc_user') || '{}');
      const updated = { ...stored, name: profile.name, phone: profile.phone };
      localStorage.setItem('hc_user', JSON.stringify(updated));
      setUser(updated);
      showSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'U';

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Loading profile...</p></div>;

  return (
    <div className="page animate-slide-up">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">Manage your personal & medical information</p>
        </div>
        <button onClick={() => editing ? handleSave() : setEditing(true)}
          className={editing ? 'btn btn-primary' : 'btn btn-secondary'} disabled={saving}>
          {saving ? <><div className="spinner" style={{width:16,height:16,borderWidth:2}}/> Saving...</>
            : editing ? <><Save size={16}/> Save Changes</> : <><Edit size={16}/> Edit Profile</>}
        </button>
      </div>

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Avatar & basic */}
        <div className="glass-card" style={{ padding:28 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, marginBottom:24 }}>
            <div className="avatar avatar-xl">{initials}</div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)' }}>{profile.name}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>{user?.email}</div>
              <span style={{ display:'inline-block', marginTop:8, padding:'4px 14px', borderRadius:999, background:'var(--cyan-glow)', color:'var(--cyan)', fontSize:12, fontWeight:600 }}>
                🧑 Patient
              </span>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name||''} disabled={!editing}
                onChange={e=>setProfile(p=>({...p,name:e.target.value}))} placeholder="Full name" />
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Phone</label>
              <input className="form-input" value={profile.phone||''} disabled={!editing}
                onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} placeholder="+91 9876543210" />
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" value={profile.dob||''} disabled={!editing}
                onChange={e=>setProfile(p=>({...p,dob:e.target.value}))} />
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Gender</label>
              <select className="form-select" value={profile.gender||''} disabled={!editing}
                onChange={e=>setProfile(p=>({...p,gender:e.target.value}))}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Address</label>
              <input className="form-input" value={profile.address||''} disabled={!editing}
                onChange={e=>setProfile(p=>({...p,address:e.target.value}))} placeholder="Your address" />
            </div>
          </div>
        </div>

        {/* Medical info */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="glass-card" style={{ padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <Heart size={16} color="var(--red)"/> Medical Information
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Blood Group</label>
                <select className="form-select" value={profile.blood_group||''} disabled={!editing}
                  onChange={e=>setProfile(p=>({...p,blood_group:e.target.value}))}>
                  <option value="">Select blood group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Known Allergies</label>
                <textarea className="form-textarea" style={{ minHeight:70 }} value={profile.allergies||''} disabled={!editing}
                  onChange={e=>setProfile(p=>({...p,allergies:e.target.value}))} placeholder="e.g., Penicillin, Pollen..." />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Chronic Conditions</label>
                <textarea className="form-textarea" style={{ minHeight:70 }} value={profile.chronic_conditions||''} disabled={!editing}
                  onChange={e=>setProfile(p=>({...p,chronic_conditions:e.target.value}))} placeholder="e.g., Diabetes, Hypertension..." />
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding:24 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <AlertCircle size={16} color="var(--red)"/> Emergency Contact
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Contact Name</label>
                <input className="form-input" value={profile.emergency_contact||''} disabled={!editing}
                  onChange={e=>setProfile(p=>({...p,emergency_contact:e.target.value}))} placeholder="Emergency contact name" />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Contact Phone</label>
                <input className="form-input" value={profile.emergency_phone||''} disabled={!editing}
                  onChange={e=>setProfile(p=>({...p,emergency_phone:e.target.value}))} placeholder="Emergency contact phone" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
