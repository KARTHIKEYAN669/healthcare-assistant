import { useState, useEffect } from 'react';
import { healthAPI } from '../api/api';
import { useApp } from '../context/AppContext';
import { Activity, Plus, TrendingUp, X, Heart, Thermometer, Wind, Droplets } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0a1628', titleColor: '#e2e8f0', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
};

export default function HealthTracking() {
  const { showSuccess, showError } = useApp();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weight:'', height:'', blood_pressure:'', heart_rate:'', blood_sugar:'', temperature:'', oxygen_saturation:'' });
  const [activeChart, setActiveChart] = useState('heart_rate');

  const load = () => {
    healthAPI.getVitals().then(r => setVitals(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const logVitals = async (e) => {
    e.preventDefault();
    try {
      await healthAPI.logVitals(form);
      showSuccess('Vitals logged successfully!');
      setForm({ weight:'', height:'', blood_pressure:'', heart_rate:'', blood_sugar:'', temperature:'', oxygen_saturation:'' });
      setShowForm(false);
      load();
    } catch { showError('Failed to log vitals'); }
  };

  const latest = vitals[0] || {};
  const reversed = [...vitals].reverse();
  const labels = reversed.map(v => new Date(v.recorded_at).toLocaleDateString('en',{month:'short',day:'numeric'}));

  const chartConfigs = {
    heart_rate: { label:'Heart Rate (bpm)', color:'#ef4444', data: reversed.map(v=>v.heart_rate) },
    weight: { label:'Weight (kg)', color:'#00d4ff', data: reversed.map(v=>v.weight) },
    blood_sugar: { label:'Blood Sugar (mg/dL)', color:'#f59e0b', data: reversed.map(v=>v.blood_sugar) },
    temperature: { label:'Temperature (°C)', color:'#10b981', data: reversed.map(v=>v.temperature) },
    oxygen_saturation: { label:'SpO2 (%)', color:'#7c3aed', data: reversed.map(v=>v.oxygen_saturation) },
  };

  const current = chartConfigs[activeChart];
  const chartData = {
    labels,
    datasets: [{
      label: current.label,
      data: current.data,
      borderColor: current.color,
      backgroundColor: `${current.color}15`,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: current.color,
      pointRadius: 4,
    }]
  };

  const vitalCards = [
    { key:'heart_rate', icon:<Heart size={18}/>, label:'Heart Rate', value: latest.heart_rate, unit:'bpm', normal:'60–100', color:'var(--red)', bg:'var(--red-glow)' },
    { key:'blood_pressure', icon:<Activity size={18}/>, label:'Blood Pressure', value: latest.blood_pressure, unit:'mmHg', normal:'<120/80', color:'var(--cyan)', bg:'var(--cyan-glow)' },
    { key:'blood_sugar', icon:<Droplets size={18}/>, label:'Blood Sugar', value: latest.blood_sugar, unit:'mg/dL', normal:'70–99', color:'var(--amber)', bg:'var(--amber-glow)' },
    { key:'temperature', icon:<Thermometer size={18}/>, label:'Temperature', value: latest.temperature, unit:'°C', normal:'36.1–37.2', color:'var(--emerald)', bg:'var(--emerald-glow)' },
    { key:'oxygen_saturation', icon:<Wind size={18}/>, label:'SpO2', value: latest.oxygen_saturation, unit:'%', normal:'95–100', color:'var(--purple-light)', bg:'var(--purple-glow)' },
    { key:'weight', icon:<TrendingUp size={18}/>, label:'Weight', value: latest.weight, unit:'kg', normal:'Varies', color:'#00d4ff', bg:'rgba(0,212,255,0.1)' },
  ];

  return (
    <div className="page animate-slide-up">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 className="page-title">Health Tracking</h2>
          <p className="page-subtitle">Monitor your vital signs and health trends</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={16}/> Log Vitals
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding:24, marginBottom:24 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20 }}>Log Today's Vitals</h3>
          <form onSubmit={logVitals}>
            <div className="grid-3">
              {[
                { key:'heart_rate', label:'Heart Rate (bpm)', type:'number', placeholder:'72' },
                { key:'blood_pressure', label:'Blood Pressure', type:'text', placeholder:'120/80' },
                { key:'blood_sugar', label:'Blood Sugar (mg/dL)', type:'number', placeholder:'95' },
                { key:'temperature', label:'Temperature (°C)', type:'number', placeholder:'36.6', step:'0.1' },
                { key:'oxygen_saturation', label:'SpO2 (%)', type:'number', placeholder:'98' },
                { key:'weight', label:'Weight (kg)', type:'number', placeholder:'70', step:'0.1' },
                { key:'height', label:'Height (cm)', type:'number', placeholder:'170' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} step={f.step||'1'} className="form-input"
                    placeholder={f.placeholder} value={form[f.key]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button type="submit" className="btn btn-primary"><Activity size={16}/> Log Vitals</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary"><X size={16}/> Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Vital cards */}
      <div className="grid-3" style={{ marginBottom:24 }}>
        {vitalCards.map(v => (
          <div key={v.key} className="glass-card" style={{ padding:18, cursor:'pointer', borderColor: activeChart===v.key ? 'rgba(0,212,255,0.3)' : 'var(--border)' }}
            onClick={() => { if (v.key !== 'blood_pressure') setActiveChart(v.key); }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:v.bg, color:v.color, display:'flex', alignItems:'center', justifyContent:'center' }}>{v.icon}</div>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>Normal: {v.normal}</span>
            </div>
            <div style={{ fontSize:24, fontWeight:800, color: v.value ? v.color : 'var(--text-muted)' }}>
              {loading ? '—' : v.value || '—'}
              <span style={{ fontSize:13, fontWeight:400, color:'var(--text-muted)', marginLeft:4 }}>{v.value ? v.unit : ''}</span>
            </div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4 }}>{v.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {vitals.length > 1 && (
        <div className="glass-card" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
              <TrendingUp size={16} style={{ display:'inline', marginRight:8, color:'var(--cyan)' }}/>
              {current.label} — Trend
            </h3>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {Object.entries(chartConfigs).map(([key, cfg]) => (
                <button key={key} onClick={() => setActiveChart(key)}
                  className={`tag ${activeChart===key ? 'tag-selected' : ''}`} style={{ fontSize:11 }}>
                  {cfg.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height:220 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {vitals.length === 0 && !loading && (
        <div className="empty-state">
          <Activity size={48} className="empty-icon"/>
          <div className="empty-title">No vitals recorded</div>
          <div className="empty-desc">Start logging your vitals to track health trends over time</div>
        </div>
      )}
    </div>
  );
}
