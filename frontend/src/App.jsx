import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Toast from './components/Toast';
import Layout from './components/Layout';

// Pages
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Symptoms from './pages/Symptoms';
import AIAssistant from './pages/AIAssistant';
import Doctors from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import Prescriptions from './pages/Prescriptions';
import MedicineReminder from './pages/MedicineReminder';
import MedicalReports from './pages/MedicalReports';
import HealthTracking from './pages/HealthTracking';
import EmergencySOS from './pages/EmergencySOS';
// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorConsultation from './pages/doctor/DoctorConsultation';
import CreatePrescription from './pages/doctor/CreatePrescription';

function PrivateRoute({ children, requireRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/dashboard'} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'doctor' ? '/doctor' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Patient Routes */}
      <Route element={<PrivateRoute requireRole="patient"><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/reminders" element={<MedicineReminder />} />
        <Route path="/reports" element={<MedicalReports />} />
        <Route path="/health-tracking" element={<HealthTracking />} />
        <Route path="/emergency" element={<EmergencySOS />} />
      </Route>

      {/* Doctor Routes */}
      <Route element={<PrivateRoute requireRole="doctor"><Layout /></PrivateRoute>}>
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/consultation/:patientId" element={<DoctorConsultation />} />
        <Route path="/doctor/prescribe/:patientId" element={<CreatePrescription />} />
        <Route path="/doctor/prescriptions" element={<Prescriptions />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Toast />
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
