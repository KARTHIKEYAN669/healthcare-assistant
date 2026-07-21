import { useState } from 'react';
import { Phone, MapPin, AlertTriangle, Heart, Ambulance, Hospital } from 'lucide-react';

const emergencyNumbers = [
  { label:'National Emergency', number:'112', icon:'🚨', color:'var(--red)', desc:'Police, Fire, Ambulance' },
  { label:'Ambulance (EMRI)', number:'108', icon:'🚑', color:'var(--red)', desc:'Emergency Medical Response' },
  { label:'Fire Emergency', number:'101', icon:'🔥', color:'var(--amber)', desc:'Fire Brigade Services' },
  { label:'Police', number:'100', icon:'👮', color:'var(--cyan)', desc:'Law Enforcement' },
  { label:'Women Helpline', number:'1091', icon:'👩', color:'var(--pink)', desc:'Women in Distress' },
  { label:'Child Helpline', number:'1098', icon:'👶', color:'var(--emerald)', desc:'Child Emergency Line' },
];

const firstAidTips = [
  { title:'Choking', steps:['Encourage coughing','Give 5 back blows between shoulder blades','Give 5 abdominal thrusts (Heimlich)','Repeat until cleared or help arrives'], color:'var(--amber)' },
  { title:'Heart Attack', steps:['Call 112 immediately','Help person sit or lie down','Loosen tight clothing','Give aspirin if not allergic','Be ready to perform CPR'], color:'var(--red)' },
  { title:'Stroke (FAST)', steps:['Face — drooping?','Arms — weakness?','Speech — slurred?','Time — call 112 NOW!'], color:'var(--purple-light)' },
  { title:'Severe Bleeding', steps:['Apply firm pressure with clean cloth','Do not remove cloth','Elevate the injured area','Call for help immediately'], color:'var(--red)' },
];

export default function EmergencySOS() {
  const [calling, setCalling] = useState(null);

  const callNumber = (number) => {
    setCalling(number);
    window.location.href = `tel:${number}`;
    setTimeout(() => setCalling(null), 3000);
  };

  return (
    <div className="page animate-slide-up">
      {/* SOS Banner */}
      <div style={{
        padding:'28px 32px', borderRadius:'var(--radius-xl)', marginBottom:28,
        background:'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
        border:'2px solid rgba(239,68,68,0.3)', animation:'glow 2s ease infinite',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:0, top:0, opacity:0.04 }}>
          <Heart size={200} fill="var(--red)" color="var(--red)"/>
        </div>
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:'var(--radius-md)', background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <AlertTriangle size={28} color="var(--red)"/>
          </div>
          <div>
            <h2 style={{ fontSize:24, fontWeight:800, color:'var(--red)' }}>Emergency SOS</h2>
            <p style={{ color:'var(--text-secondary)', fontSize:14 }}>If you are in immediate danger — call emergency services NOW</p>
          </div>
        </div>
        <button onClick={() => callNumber('112')}
          style={{
            padding:'16px 32px', borderRadius:'var(--radius-lg)', border:'none', cursor:'pointer',
            background:'linear-gradient(135deg, #ef4444, #dc2626)', color:'#fff',
            fontSize:18, fontWeight:800, display:'flex', alignItems:'center', gap:12,
            boxShadow:'0 0 40px rgba(239,68,68,0.5)', animation:'pulse 1.5s ease infinite',
          }}>
          <Phone size={22}/> CALL 112 — EMERGENCY
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom:28 }}>
        {/* Emergency numbers */}
        <div className="glass-card" style={{ padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:18, display:'flex', gap:8, alignItems:'center' }}>
            <Phone size={16} color="var(--cyan)"/> Emergency Numbers
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {emergencyNumbers.map(e => (
              <button key={e.number} onClick={() => callNumber(e.number)}
                style={{
                  display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
                  borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.04)',
                  border:`1px solid ${calling===e.number ? e.color : 'var(--border)'}`,
                  cursor:'pointer', transition:'var(--transition)',
                  background: calling===e.number ? `${e.color}15` : 'rgba(255,255,255,0.04)',
                  textAlign:'left',
                }}
                onMouseEnter={el => el.currentTarget.style.borderColor=e.color}
                onMouseLeave={el => { if(calling!==e.number) el.currentTarget.style.borderColor='var(--border)'; }}>
                <span style={{ fontSize:24 }}>{e.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{e.label}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{e.desc}</div>
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:e.color }}>{e.number}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Nearest hospitals placeholder */}
        <div className="glass-card" style={{ padding:24 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:18, display:'flex', gap:8, alignItems:'center' }}>
            <MapPin size={16} color="var(--cyan)"/> Nearby Hospitals
          </h3>
          <div style={{ padding:20, borderRadius:'var(--radius-md)', background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.1)', textAlign:'center', marginBottom:16 }}>
            <MapPin size={32} color="var(--cyan)" style={{ opacity:0.5, margin:'0 auto 10px' }}/>
            <p style={{ fontSize:13, color:'var(--text-secondary)' }}>Location access enables nearest hospital suggestions</p>
            <button className="btn btn-secondary btn-sm" style={{ marginTop:12 }}
              onClick={() => navigator.geolocation?.getCurrentPosition(() => alert('Location detected! In production, this shows nearby hospitals.'))}>
              <MapPin size={14}/> Enable Location
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {['Apollo Hospital','Fortis Healthcare','Max Super Speciality','AIIMS Emergency'].map(h => (
              <div key={h} style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 12px', borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(239,68,68,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>🏥</div>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* First aid */}
      <div>
        <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', marginBottom:18 }}>
          🩺 Quick First Aid Guide
        </h3>
        <div className="grid-2">
          {firstAidTips.map(tip => (
            <div key={tip.title} className="glass-card" style={{ padding:20 }}>
              <h4 style={{ fontSize:14, fontWeight:700, color:tip.color, marginBottom:12 }}>🚨 {tip.title}</h4>
              <ol style={{ paddingLeft:18, display:'flex', flexDirection:'column', gap:6 }}>
                {tip.steps.map((s,i) => (
                  <li key={i} style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop:20, padding:16, borderRadius:'var(--radius-md)', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.15)' }}>
        <AlertTriangle size={16} color="var(--amber)" style={{ display:'inline', marginRight:8 }}/>
        <span style={{ fontSize:13, color:'var(--amber)' }}>
          This is general first aid guidance only. In a real emergency, always call professional emergency services immediately.
        </span>
      </div>
    </div>
  );
}
