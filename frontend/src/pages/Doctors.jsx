import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorAPI } from '../api/api';
import { Search, Star, MapPin, Briefcase, ChevronRight } from 'lucide-react';

const specialties = ['All','Cardiologist','Neurologist','General Physician','Orthopedic','Pediatrician','Dermatologist','Gynecologist','Psychiatrist','Endocrinologist','Pulmonologist','Ophthalmologist','ENT Specialist'];

export default function Doctors() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || 'All');

  useEffect(() => {
    setLoading(true);
    doctorAPI.getAll(specialty === 'All' ? '' : specialty)
      .then(r => setDoctors(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [specialty]);

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page animate-slide-up">
      <div className="page-header">
        <h2 className="page-title">Find Doctors</h2>
        <p className="page-subtitle">Browse our network of qualified healthcare professionals</p>
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:24 }}>
        <div className="search-box" style={{ flex:1, minWidth:250 }}>
          <Search size={16} className="search-icon"/>
          <input className="form-input" style={{ paddingLeft:38 }} placeholder="Search doctors, specialties, hospitals..."
            value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      {/* Specialty filter */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {specialties.map(s => (
          <button key={s} onClick={() => setSpecialty(s)}
            className={`tag ${specialty===s ? 'tag-selected' : ''}`}>
            {s}
          </button>
        ))}
      </div>

      <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
        {filtered.length} doctor{filtered.length!==1?'s':''} found
      </p>

      {loading ? (
        <div className="loading-page"><div className="spinner"/><p>Finding doctors...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👨‍⚕️</div>
          <div className="empty-title">No doctors found</div>
          <div className="empty-desc">Try a different search or specialty</div>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(doc => (
            <div key={doc.id} className="glass-card" style={{ padding:24, cursor:'pointer', display:'flex', flexDirection:'column', gap:16 }}
              onClick={() => navigate(`/book-appointment/${doc.id}`)}>
              {/* Top: avatar + name */}
              <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                <div className="avatar avatar-lg" style={{ fontSize:24, flexShrink:0 }}>
                  {doc.name?.split(' ').slice(1).map(n=>n[0]).join('').slice(0,2) || 'DR'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>{doc.name}</div>
                  <div style={{ fontSize:13, color:'var(--cyan)', fontWeight:600 }}>{doc.specialty}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{doc.qualification}</div>
                </div>
              </div>

              {/* Info */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-secondary)' }}>
                  <MapPin size={13} color="var(--text-muted)"/>{doc.hospital}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-secondary)' }}>
                  <Briefcase size={13} color="var(--text-muted)"/>{doc.experience} years experience
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  {'★'.repeat(Math.floor(doc.rating||4.5))}{'☆'.repeat(5-Math.floor(doc.rating||4.5))}
                  <span style={{ fontSize:13, color:'var(--text-secondary)', marginLeft:4 }}>{doc.rating}</span>
                </div>
              </div>

              {/* Bio */}
              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5, flex:1 }}>{doc.bio}</p>

              {/* Footer */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:14 }}>
                <div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>Consultation Fee</div>
                  <div style={{ fontSize:18, fontWeight:800, color:'var(--emerald)' }}>₹{doc.fee}</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/book-appointment/${doc.id}`); }}>
                  Book Now <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
