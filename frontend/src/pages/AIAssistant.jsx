import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, User, AlertTriangle, Sparkles, RefreshCw, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const INITIAL_MSG = {
  id: 1, role: 'assistant',
  content: `Hello! I'm your **AI Health Assistant** 👋\n\nI can provide general health guidance based on your symptoms and questions. Please note that I'm not a substitute for professional medical advice.\n\n**You can ask me about:**\n• Symptoms and possible causes\n• General wellness tips\n• When to see a doctor\n• Medication guidance\n• Mental health support\n\nHow can I help you today?`,
  time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
};

const quickPrompts = [
  'I have a headache and fever',
  'My chest feels tight',
  "I've been feeling very anxious",
  'I have a persistent cough',
  'My stomach has been hurting',
];

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/• /g, '• ');
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setInput(text);
      };
      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if (!isSpeakingEnabled) return;
    window.speechSynthesis?.cancel(); // stop current speech
    // strip markdown before speaking
    const cleanText = text.replace(/\*\*|🚨|👨‍⚕️|🧑|👋|•|⚠️/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis?.speak(utterance);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    if (isListening) recognitionRef.current?.stop();

    const userMsg = { id: Date.now(), role:'user', content: msg, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiAPI.chat(msg);
      const aiResponseText = res.data.response;
      const aiMsg = { id: Date.now()+1, role:'assistant', content: aiResponseText, time: new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) };
      setMessages(prev => [...prev, aiMsg]);
      speakText(aiResponseText);
    } catch (err) {
      const errMsg = { id: Date.now()+1, role:'assistant', content: 'Sorry, I encountered an error. Please try again.', time: '', isError:true };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setMessages([INITIAL_MSG]);
  };

  return (
    <div className="page animate-slide-up" style={{ height:'calc(100vh - var(--navbar-height) - 40px)', display:'flex', flexDirection:'column', padding:'28px', maxWidth:'900px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyBetween:'space-between', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:'var(--radius-md)', background:'linear-gradient(135deg, #7c3aed, #00d4ff)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-cyan)' }}>
            <Bot size={24} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>AI Health Assistant</div>
            <div style={{ fontSize:12, color:'var(--emerald)', display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--emerald)', display:'inline-block' }}/>
              Online • Ready to help
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => {
            const nextMode = !isSpeakingEnabled;
            setIsSpeakingEnabled(nextMode);
            if (!nextMode) window.speechSynthesis?.cancel();
          }} className="btn btn-ghost btn-sm" title={isSpeakingEnabled ? "Mute Speech" : "Unmute Speech"}>
            {isSpeakingEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={clearChat} className="btn btn-ghost btn-sm">
            <RefreshCw size={14}/> Clear
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ display:'flex', gap:8, padding:'10px 14px', borderRadius:'var(--radius-md)', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.15)', marginBottom:16, flexShrink:0 }}>
        <AlertTriangle size={15} color="var(--amber)" style={{ flexShrink:0, marginTop:1 }}/>
        <p style={{ fontSize:12, color:'var(--amber)', lineHeight:1.5 }}>
          This AI provides general health information only. Always consult a qualified doctor for medical advice, diagnosis, or treatment.
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:16, paddingRight:4 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display:'flex', gap:12, flexDirection: msg.role==='user' ? 'row-reverse' : 'row', alignItems:'flex-end' }}>
            <div style={{
              width:34, height:34, borderRadius:'50%', flexShrink:0,
              background: msg.role==='user' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #7c3aed, #00d4ff)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {msg.role==='user' ? <User size={16} color="#fff"/> : <Bot size={16} color="#fff"/>}
            </div>
            <div style={{
              maxWidth:'82%', padding:'16px 20px', borderRadius: msg.role==='user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: msg.role==='user' ? 'var(--gradient-primary)' : 'rgba(15, 23, 42, 0.75)',
              border: msg.role==='user' ? 'none' : '1px solid rgba(0, 212, 255, 0.15)',
              boxShadow: msg.role==='user' ? '0 4px 20px rgba(0,212,255,0.25)' : '0 8px 32px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(12px)',
              color: msg.role==='user' ? '#fff' : 'var(--text-primary)',
              fontSize:14, lineHeight:1.75,
            }}>
              {msg.role==='user' ? msg.content : (
                <>
                  <div className="ai-response-formatted" dangerouslySetInnerHTML={{
                    __html: formatMessage(msg.content)
                      .replace(/🩺 <strong>Assessment:<\/strong>/g, '<div className="ai-section-title text-cyan">🩺 Assessment</div>')
                      .replace(/⚡ <strong>Key Steps:<\/strong>/g, '<div className="ai-section-title text-emerald">⚡ Key Steps</div>')
                      .replace(/🚨 <strong>Seek Doctor If:<\/strong>/g, '<div className="ai-section-title text-amber">🚨 Seek Doctor If</div>')
                  }} />
                  {msg.role === 'assistant' && !msg.isError && (
                    <div style={{ display:'flex', gap:10, marginTop:12, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.08)', flexWrap:'wrap', alignItems:'center' }}>
                      <button onClick={() => navigator.clipboard.writeText(msg.content)} className="btn btn-ghost btn-sm" style={{ fontSize:11, padding:'4px 8px', color:'var(--text-muted)' }}>
                        📋 Copy Guidance
                      </button>
                      <a href="/doctors" className="btn btn-primary btn-sm" style={{ fontSize:11, padding:'4px 10px' }}>
                        👨‍⚕️ Book Doctor
                      </a>
                    </div>
                  )}
                </>
              )}
              {msg.time && <div style={{ fontSize:10, opacity:0.5, marginTop:6, textAlign: msg.role==='user' ? 'right' : 'left' }}>{msg.time}</div>}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display:'flex', gap:12, alignItems:'flex-end' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, #7c3aed, #00d4ff)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Bot size={16} color="#fff"/>
            </div>
            <div style={{ padding:'14px 20px', borderRadius:'18px 18px 18px 4px', background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', animation:`typing 1s ease ${i*0.2}s infinite` }}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:16, flexShrink:0 }}>
          <p style={{ width:'100%', fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
            <Sparkles size={12}/> Quick prompts:
          </p>
          {quickPrompts.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="tag" style={{ fontSize:12, padding:'6px 12px' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{ display:'flex', gap:12, marginTop:16, padding:'14px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', flexShrink:0, alignItems:'center' }}>
        <button onClick={toggleListening}
          style={{
            width:40, height:40, borderRadius:'var(--radius-md)', border:'none', cursor:'pointer',
            background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
            color: isListening ? 'var(--red)' : 'var(--text-muted)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            transition:'var(--transition)',
          }} title={isListening ? "Stop Listening" : "Start Voice Input"}>
          {isListening ? <MicOff size={18} style={{ animation:'pulse 1s infinite' }} /> : <Mic size={18}/>}
        </button>
        <textarea
          value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Describe your symptoms or ask a health question..."
          style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text-primary)', fontSize:14, fontFamily:'inherit', resize:'none', maxHeight:120, lineHeight:1.5 }}
          rows={1}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          style={{
            width:40, height:40, borderRadius:'var(--radius-md)', border:'none', cursor:'pointer',
            background: input.trim() ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)',
            color: input.trim() ? '#fff' : 'var(--text-muted)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            transition:'var(--transition)',
          }}>
          <Send size={18}/>
        </button>
      </div>
    </div>
  );
}
