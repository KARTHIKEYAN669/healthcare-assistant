import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://healthcare-assistant-backend-ombn.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — logout user
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hc_token');
      localStorage.removeItem('hc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Patients
export const patientAPI = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getDashboard: () => api.get('/patients/dashboard'),
};

// Doctors
export const doctorAPI = {
  getAll: (specialty) => api.get('/doctors', { params: { specialty } }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecialties: () => api.get('/doctors/meta/specialties'),
};

// Appointments
export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  book: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
  getSlots: (doctorId, date) => api.get(`/appointments/slots/${doctorId}`, { params: { date } }),
};

// Prescriptions
export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
};

// AI
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  analyzeSymptoms: (symptoms) => api.post('/ai/analyze-symptoms', { symptoms }),
};

// Reminders
export const reminderAPI = {
  getAll: () => api.get('/reminders'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`),
};

// Reports
export const reportAPI = {
  getAll: () => api.get('/reports'),
  create: (data) => api.post('/reports', data),
  delete: (id) => api.delete(`/reports/${id}`),
};

// Health / Vitals
export const healthAPI = {
  getVitals: () => api.get('/health/vitals'),
  logVitals: (data) => api.post('/health/vitals', data),
  getMyPatients: () => api.get('/health/my-patients'),
  getPatientHistory: (patientId) => api.get(`/health/patient-history/${patientId}`),
};

export default api;
