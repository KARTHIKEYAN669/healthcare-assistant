import { useState, useEffect } from 'react';
import { reminderAPI } from '../api/api';
import { useApp } from '../context/AppContext';
import { Bell, Plus, Trash2, Check, X, Pill, Clock } from 'lucide-react';

const FREQUENCIES = ['Once daily','Twice daily','Three times daily','Every 6 hours','Every 8 hours','Weekly','As needed'];
const TIME_OPTIONS = ['6:00 AM','8:00 AM','10:00 AM','12:00 PM','2:00 PM','4:00 PM','6:00 PM','8:00 PM','10:00 PM'];

export default function MedicineReminder() {
  const { showSuccess, showError } = useApp();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ medicine_name:'', dosage:'', frequency:'Once daily', times:[], start_date:'', end_date:'' });

  const load = () => {
    reminderAPI.getAll().then(r => setReminders(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleTime = (t) => setForm(f => ({
    ...f, times: f.times.includes(t) ? f.times.filter(x=>x!==t) : [...f.times, t]
  }));

  const addReminder = async (e) => {
    e.preventDefault();
    if (!form.medicine_name) { showError('Medicine name is required'); return; }
    try {
      await reminderAPI.create(form);
      showSuccess('Reminder added!');
      setForm({ medicine_name:'', dosage:'', frequency:'Once daily', times:[], start_date:'', end_date:'' });
      setShowForm(false);
      load();
    } catch { showError('Failed to add reminder'); }
  };

  const deleteReminder = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    try { await reminderAPI.delete(id); showSuccess('Reminder deleted'); load(); }
    catch { showError('Failed to delete'); }
  };

  const toggleActive = async (r) => {
    try {
      await reminderAPI.update(r.id, { ...r, active: !r.active });
      showSuccess(r.active ? 'Reminder paused' : 'Reminder activated');
      load();
    } catch { showError('Failed to update'); }
  };

  return (
    <div className="page animate-slide-up">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 className="page-title">Medicine Reminders</h2>
          <p className="page-subtitle">Manage your medication schedule</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16}/> Add Reminder
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass-card" style={{ padding:24, marginBottom:24 }} id="add-reminder-form">
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20 }}>
            <Pill size={16} style={{ display:'inline', marginRight:8, color:'var(--amber)' }}/>
            New Medicine Reminder
          </h3>
          <form onSubmit={addReminder}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Medicine Name *</label>
                <input className="form-input" value={form.medicine_name}
                  onChange={e=>setForm(f=>({...f,medicine_name:e.target.value}))} placeholder="e.g., Paracetamol" required />
              </div>
              <div className="form-group">
                <label className="form-label">Dosage</label>
                <input className="form-input" value={form.dosage}
                  onChange={e=>setForm(f=>({...f,dosage:e.target.value}))} placeholder="e.g., 500mg" />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select className="form-select" value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))}>
                  {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={form.start_date}
                  onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" value={form.end_date}
                  onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reminder Times</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {TIME_OPTIONS.map(t => (
                  <button key={t} type="button" onClick={() => toggleTime(t)}
                    className={`tag ${form.times.includes(t) ? 'tag-selected' : ''}`}>
                    <Clock size={11}/> {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <button type="submit" className="btn btn-primary"><Bell size={16}/> Add Reminder</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary"><X size={16}/> Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-page"><div className="spinner"/></div>
      ) : reminders.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} className="empty-icon"/>
          <div className="empty-title">No reminders set</div>
          <div className="empty-desc">Add medicine reminders to stay on track with your medications</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {reminders.map(r => (
            <div key={r.id} className="glass-card" style={{ padding:20, opacity: r.active ? 1 : 0.6 }}>
              <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ width:50, height:50, borderRadius:'var(--radius-md)', background: r.active ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', border:`1px solid ${r.active ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Pill size={22} color={r.active ? 'var(--amber)' : 'var(--text-muted)'}/>
                </div>
                <div style={{ flex:1, minWidth:150 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{r.medicine_name}</div>
                  <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:3 }}>{r.dosage} • {r.frequency}</div>
                  {r.times?.length > 0 && (
                    <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                      {r.times.map(t => (
                        <span key={t} style={{ padding:'2px 8px', borderRadius:999, background:'rgba(0,212,255,0.08)', color:'var(--cyan)', fontSize:11, fontWeight:500 }}>
                          <Clock size={9} style={{ display:'inline', marginRight:3 }}/>{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => toggleActive(r)} className={`btn btn-sm ${r.active ? 'btn-secondary' : 'btn-success'}`}>
                    {r.active ? <><X size={13}/> Pause</> : <><Check size={13}/> Enable</>}
                  </button>
                  <button onClick={() => deleteReminder(r.id)} className="btn btn-ghost btn-sm" style={{ color:'var(--red)' }}>
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
