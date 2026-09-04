# 🏥 MyHealth Hub — Connected AI Healthcare Platform (India)

**MyHealth Hub** is an AI-powered healthcare portal designed for patients and doctors in India. It features real-time Fitbit smart wearable telemetry integration, statistical health progress/deterioration analytics, diagnostic RAG (Retrieval-Augmented Generation), Doctor Human-In-The-Loop (HITL) prescription refill approvals, and localized emergency services (`112 / 108`).

---

## 🌟 Key Features

- **🇮🇳 Indian Localization**:
  - Emergency Speed Dial (`112 / 108`), Indian mobile contact formats (`+91`), Indian patient & doctor profiles, and nearby healthcare facilities (Apollo Pharmacy 24/7, Dr. Lal PathLabs, Fortis Urgent Care).
- **⌚ Fitbit Wearable Telemetry Integration**:
  - Live step counter progress ring (10,000 steps goal), continuous heart rate stream (BPM), resting HR, active zone exercise minutes, sleep quality tracker, and interactive **"Sync Fitbit"** button.
- **📊 Graphical Telemetry Analytics & AI Health Index**:
  - Glassmorphism multi-axis charts for Blood Sugar (Fasting & PP target zones 70–140 mg/dL), Blood Pressure, SpO2, and Fitbit Activity.
  - Dynamic **Health Score (0-100)** with **Progress** (`+7.5% Health Improvement`) and **Deterioration Alert** badges.
- **🩺 Physician Clinical Command Center**:
  - Interactive today's patient visit queue, complete medical record inspector, AI clinical co-pilot summary generator, and Doctor HITL prescription refill approval workflows.
- **🔐 Portal Auth & Recovery**:
  - Patient & Doctor sign-in, account registration with automated welcome email notifications, and **"Forgot Password?"** OTP email dispatch.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4 (`@tailwindcss/postcss`), Lucide Icons, Glassmorphism Design System.
- **Backend**: FastAPI (Python 3.11), Pydantic v2, Uvicorn, LangGraph, ChromaDB Vector Vault.
- **Wearable / IoT**: Fitbit Sense 2 telemetry streaming API.

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup (React / Vite)
```bash
cd frontend
npm install
npm run dev
```

Visit the application at **`http://localhost:5173`** (or `http://localhost:5174`).

---

## 🐳 Production Container Deployment (Docker)

To deploy using Docker & Docker Compose:

```bash
docker-compose up --build -d
```

- Frontend served via Nginx on port `80`
- Backend API served via Uvicorn on port `8000`

---

## 🔑 Demo Credentials

- **Patient Login (Aarav Sharma)**: `aarav@example.com` / `password123`
- **Doctor Login (Dr. Ananya Adkar)**: `ananya@myhealth.com` / `doctor123`

---

## 📄 License

MIT License. Designed for scalable healthcare access across India.
