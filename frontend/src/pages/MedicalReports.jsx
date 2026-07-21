import { useState, useEffect } from 'react';
import { reportAPI } from '../api/api';
import { useApp } from '../context/AppContext';
import { FolderHeart, Plus, Trash2, Bot, X, Upload, ChevronDown, ChevronUp } from 'lucide-react';

const REPORT_TYPES = ['Blood Test','X-Ray','MRI','CT Scan','ECG','Urine Test','Ultrasound','Biopsy','Other'];

export default function MedicalReports() {
  const { showSuccess, showError } = useApp();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', type:'', notes:'' });
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    reportAPI.getAll().then(r => setReports(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const addReport = async (e) => {
    e.preventDefault();
    if (!form.title) { showError('Report title required'); return; }
    try {
      await reportAPI.create(form);
      showSuccess('Report added with AI summary!');
      setForm({ title:'', type:'', notes:'' });
      setShowForm(false);
      load();
    } catch { showError('Failed to add report'); }
  };

  const deleteReport = async (id) => {
    if (!confirm('Delete this report?')) return;
    try { await reportAPI.delete(id); showSuccess('Report deleted'); load(); }
    catch { showError('Failed to delete'); }
  };

  const typeColors = {
    'Blood Test':'var(--red)', 'X-Ray':'var(--cyan)', 'MRI':'var(--purple-light)',
    'CT Scan':'var(--amber)', 'ECG':'var(--emerald)', 'Urine Test':'var(--amber)', default:'var(--text-muted)'
  };

  return (
    <div className="page animate-slide-up">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 className="page-title">Medical Reports</h2>
          <p className="page-subtitle">Store and AI-analyze your medical reports</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16}/> Add Report
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding:24, marginBottom:24 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20 }}>
            <Upload size={16} style={{ display:'inline', marginRight:8, color:'var(--cyan)' }}/>
            Add Medical Report
          </h3>
          <form onSubmit={addReport}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Report Title *</label>
                <input className="form-input" value={form.title}
                  onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g., Full Blood Count — July 2026" required />
              </div>
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  <option value="">Select type</option>
                  {REPORT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes / Observations</label>
              <textarea className="form-textarea" value={form.notes}
                onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any additional notes..." />
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button type="submit" className="btn btn-primary"><Bot size={16}/> Add & Get AI Summary</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary"><X size={16}/> Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-page"><div className="spinner"/></div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <FolderHeart size={48} className="empty-icon"/>
          <div className="empty-title">No reports uploaded</div>
          <div className="empty-desc">Add your medical reports to get AI-powered summaries</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {reports.map(r => (
            <div key={r.id} className="glass-card" style={{ overflow:'hidden' }}>
              <div style={{ padding:'18px 22px', display:'flex', gap:14, alignItems:'center', cursor:'pointer' }}
                onClick={() => setExpanded(expanded===r.id ? null : r.id)}>
                <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <FolderHeart size={20} color={typeColors[r.type] || typeColors.default}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{r.title}</div>
                  <div style={{ display:'flex', gap:10, marginTop:4 }}>
                    {r.type && <span style={{ fontSize:12, padding:'2px 8px', borderRadius:999, background:'rgba(0,212,255,0.08)', color:'var(--cyan)', fontWeight:500 }}>{r.type}</span>}
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button onClick={e=>{e.stopPropagation();deleteReport(r.id);}} className="btn btn-ghost btn-sm" style={{ color:'var(--red)' }}>
                    <Trash2 size={14}/>
                  </button>
                  {expanded===r.id ? <ChevronUp size={16} color="var(--text-muted)"/> : <ChevronDown size={16} color="var(--text-muted)"/>}
                </div>
              </div>
              {expanded===r.id && (
                <div style={{ borderTop:'1px solid var(--border)', padding:'20px 22px' }}>
                  {r.notes && (
                    <div style={{ marginBottom:16 }}>
                      <h4 style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', marginBottom:6 }}>Notes</h4>
                      <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>{r.notes}</p>
                    </div>
                  )}
                  {r.ai_summary && (
                    <div style={{ padding:16, borderRadius:'var(--radius-md)', background:'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,212,255,0.08))', border:'1px solid rgba(0,212,255,0.15)' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
                        <Bot size={16} color="var(--cyan)"/>
                        <span style={{ fontSize:13, fontWeight:700, color:'var(--cyan)' }}>AI Summary</span>
                      </div>
                      <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>{r.ai_summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
