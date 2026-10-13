# Pilotree - Customer Inquiry Management System

An intelligent full-stack logistics inquiry management dashboard powered by FastAPI, React (Vite), and Gemini AI.

## Features

- **Customer Inquiry Dashboard**: Browse and filter customer logistics enquiries.
- **AI-Powered Analysis**: Extract key details, categorize issues, determine priority, pinpoint missing information, and generate recommended actions using Gemini.
- **Automated Email Composer**: One-click generation of missing information request emails with auto-fill recipient, subject, and pre-drafted body.
- **Multi-Provider Email Sending**:
  - Live sending via **Resend API**
  - Live sending via **SMTP** (Gmail, Outlook, SES)
  - Desktop client integration (**mailto** support for Outlook / Apple Mail / Gmail)
  - Simulated delivery tracking mode with message IDs and audit logs

---

## Architecture

- **`backend/`**: FastAPI REST API, OpenAI-compatible Gemini client, Resend & SMTP email dispatchers.
- **`frontend/`**: Vite + React modern UI with responsive styling and real-time email composer.

---

## Local Development Setup

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## Deployment

### Backend (Render / Railway)
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `GEMINI_API_KEY`: `<your_key>`
  - `GEMINI_MODEL`: `gemini-3.5-flash-lite`

### Frontend (Vercel)
- **Root Directory**: `frontend`
- **Framework Preset**: Vite
- **Environment Variables**:
  - `VITE_API_BASE`: `<your_deployed_backend_url>`
