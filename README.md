# AI HealthCare Assistant (Full-Stack Web App)

A modern full-stack web application designed to guide patients through symptoms analysis (via custom rule/AI processing), doctor booking, prescriptions, medication reminders, and general health monitoring. Includes a built-in Doctor Dashboard to handle patient consultations.

## Project Structure

- `/frontend`: React + Vite SPA using a Custom Glassmorphism CSS Design System.
- `/backend`: Node.js + Express REST API backed by a SQL.js database (SQLite in JS).

## Development Setup

### 1. Start Backend API
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev
# React app runs on http://localhost:5173
```

## Production & Cloud Deployment

### Frontend (Vercel)
- Set root directory to `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Deployment uses `vercel.json` for routing rewrites to the API server.

### Backend (Render)
- Deploy using the provided `render.yaml` template.
- Ensure the SQLite `healthcare.db` file persists or use a hosted PostgreSQL for persistent production environments.
