import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

export default function Toast() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {icons[t.type]}
          <span className="toast-message">{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'inherit',padding:'2px' }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
