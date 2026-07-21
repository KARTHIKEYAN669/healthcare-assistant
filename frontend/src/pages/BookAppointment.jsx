import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { doctorAPI, appointmentAPI } from '../api/api';
import { Calendar, Clock, MapPin, Star, ArrowLeft, CheckCircle } from 'lucide-react';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useApp();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    doctorAPI.getById(doctorId).then(r => setDoctor(r.data)).catch(() => navigate('/doctors')).finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (!date) return;
    setSlotsLoading(true);
    setSelectedSlot('');
    appointmentAPI.getSlots(doctorId, date)
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [date, doctorId]);

  const handleBook = async () => {
    if (!date || !selectedSlot) { showError('Please select a date and time slot'); return; }
    setBooking(true);
    try {
      await appointmentAPI.book({ doctor_id: doctorId, date, time_slot: selectedSlot, reason });
      setBooked(true);
      showSuccess('Appointment booked successfully!');
    } catch (err) {
      showError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/><p>Loading doctor info...</p></div>;
  if (!doctor) return null;

  if (booked) return (
    <div className="page animate-slide-up" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--emerald-glow)', border:'2px solid var(--emerald)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--emerald)' }}>
          <CheckCircle size={40}/>
        </div>
        <h2 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)', marginBottom:8 }}>Appointment Booked!</h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:24 }}>
          Your appointment with <strong style={{ color:'var(--cyan)' }}>{doctor.name}</strong> on <strong>{date}</strong> at <strong>{selectedSlot}</strong> has been confirmed.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button onClick={() => navigate('/appointments')} className="btn btn-primary">View Appointments</button>
          <button onClick={() => navigate('/doctors')} className="btn btn-secondary">Find More Doctors</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page animate-slide-up">
      <button onClick={() => navigate('/doctors')} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>
        <ArrowLeft size={16}/> Back to Doctors
      </button>

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Doctor card */}
        <div className="glass-card" style={{ padding:24 }}>
          <div style={{ display:'flex', gap:16, marginBottom:20 }}>
            <div className="avatar" style={{ width:70, height:70, fontSize:26, flexShrink:0 }}>
              {doctor.name?.split(' ').slice(1).map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)' }}>{doctor.name}</div>
              <div style={{ color:'var(--cyan)', fontSize:14, fontWeight:600, marginTop:2 }}>{doctor.specialty}</div>
              <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>{doctor.qualification}</div>
              <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
                <Star size={13} color="var(--amber)" fill="var(--amber)"/>
                <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{doctor.rating} • {doctor.experience} yrs exp.</span>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', fontSize:13, color:'var(--text-secondary)' }}>
              <MapPin size={14} color="var(--text-muted)"/>{doctor.hospital}
            </div>
          </div>

          <div style={{ marginTop:16, padding:16, borderRadius:'var(--radius-md)', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Consultation Fee</div>
            <div style={{ fontSize:28, fontWeight:800, color:'var(--emerald)' }}>₹{doctor.fee}</div>
          </div>

          <div style={{ marginTop:14, padding:14, borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{doctor.bio}</p>
          </div>
        </div>

        {/* Booking form */}
        <div className="glass-card" style={{ padding:24 }}>
          <h3 style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
            <Calendar size={18} color="var(--cyan)"/> Book Appointment
          </h3>

          <div className="form-group">
            <label className="form-label">Select Date</label>
            <input type="date" className="form-input" value={date} min={today}
              onChange={e => setDate(e.target.value)} />
          </div>

          {date && (
            <div className="form-group">
              <label className="form-label">Available Time Slots</label>
              {slotsLoading ? (
                <div style={{ padding:20, textAlign:'center' }}><div className="spinner" style={{ margin:'auto' }}/></div>
              ) : slots.length === 0 ? (
                <div style={{ padding:14, borderRadius:'var(--radius-md)', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--red)', fontSize:13 }}>
                  No slots available for this date. Try another day.
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {slots.map(slot => (
                    <button key={slot} onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding:'9px 8px', borderRadius:'var(--radius-md)', border:'1px solid',
                        cursor:'pointer', fontSize:12, fontWeight:600, transition:'var(--transition)',
                        borderColor: selectedSlot===slot ? 'var(--cyan)' : 'var(--border)',
                        background: selectedSlot===slot ? 'var(--cyan-glow)' : 'rgba(255,255,255,0.03)',
                        color: selectedSlot===slot ? 'var(--cyan)' : 'var(--text-secondary)',
                      }}>
                      <Clock size={11} style={{ marginRight:4 }}/>{slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reason for Visit (optional)</label>
            <textarea className="form-textarea" value={reason} onChange={e=>setReason(e.target.value)}
              placeholder="Briefly describe your health concern..." style={{ minHeight:80 }} />
          </div>

          <button onClick={handleBook} className="btn btn-primary btn-lg w-full" disabled={!date || !selectedSlot || booking}>
            {booking ? <><div className="spinner" style={{width:18,height:18,borderWidth:2}}/> Booking...</> : <><Calendar size={18}/> Confirm Appointment</>}
          </button>
        </div>
      </div>
    </div>
  );
}
