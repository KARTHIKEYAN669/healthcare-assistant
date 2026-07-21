import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthAPI } from '../../api/api';
import { Users, FileText, Stethoscope, Search } from 'lucide-react';

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    healthAPI.getMyPatients().then(r => setPatients(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page animate-slide-up">
      <div className="page-header">
        <h2 className="page-title">My Patients</h2>
        <p className="page-subtitle">Patients who have booked appointments with you</p>
      </div>

      <div className="search-box" style={{ marginBottom:24, maxWidth:400 }}>
        <Search size={16} className="search-icon"/>
        <input className="form-input" style={{ paddingLeft:38 }} placeholder="Search patients..."
          value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner"/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-icon"/>
          <div className="empty-title">No patients found</div>
          <div className="empty-desc">Patients who book appointments with you will appear here</div>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(p => {
            const initials = p.name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'P';
            return (
              <div key={p.id} className="glass-card" style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div className="avatar" style={{ width:48, height:48, fontSize:18 }}>{initials}</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{p.email}</div>
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {p.blood_group && (
                    <div style={{ display:'flex', gap:8, fontSize:13 }}>
                      <span style={{ color:'var(--text-muted)', width:110 }}>Blood Group:</span>
                      <span style={{ color:'var(--red)', fontWeight:600 }}>{p.blood_group}</span>
                    </div>
                  )}
                  {p.dob && (
                    <div style={{ display:'flex', gap:8, fontSize:13 }}>
                      <span style={{ color:'var(--text-muted)', width:110 }}>Date of Birth:</span>
                      <span style={{ color:'var(--text-secondary)' }}>{p.dob}</span>
                    </div>
                  )}
                  {p.chronic_conditions && (
                    <div style={{ display:'flex', gap:8, fontSize:13 }}>
                      <span style={{ color:'var(--text-muted)', width:110 }}>Conditions:</span>
                      <span style={{ color:'var(--amber)', fontSize:12 }}>{p.chronic_conditions}</span>
                    </div>
                  )}
                </div>

                <div style={{ display:'flex', gap:8, borderTop:'1px solid var(--border)', paddingTop:12 }}>
                  <button onClick={() => navigate(`/doctor/consultation/${p.id}`)} className="btn btn-secondary btn-sm" style={{ flex:1 }}>
                    <FileText size={13}/> History
                  </button>
                  <button onClick={() => navigate(`/doctor/prescribe/${p.id}`)} className="btn btn-primary btn-sm" style={{ flex:1 }}>
                    <Stethoscope size={13}/> Prescribe
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
