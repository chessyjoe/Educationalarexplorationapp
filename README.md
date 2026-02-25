# Educational AR Exploration App (Pocket Science)

An immersive educational mobile-first web app that lets children discover the natural world using their camera and AI. Discoveries are identified by a multi-agent AI system (Gemini), narrated with age-appropriate stories, and saved to a personal museum.

**Stack:** React + TypeScript + Vite (frontend) · FastAPI + Python (backend) · Firebase Auth + Firestore · Google Gemini AI

---

## Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18+ |
| npm | 9+ |
| Python | 3.9+ |

---

## Quick Start

### 1. Clone & Install Frontend

```bash
git clone https://github.com/chessyjoe/Educationalarexplorationapp.git
cd Educationalarexplorationapp
npm install
```

### 2. Configure Frontend Environment

Create a `.env` file in the **project root** (copy from the guide):

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:8000
```

> See [docs/firebase-setup.md](docs/firebase-setup.md) for how to get these values.

### 3. Start Frontend

```bash
npm run dev
```

Runs at **http://localhost:5173**

---

### 4. Set Up Backend

```bash
cd backend
```

**Create & activate a virtual environment:**

```bash
# macOS / Linux
python -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Configure environment:**

```bash
cp .env.example .env
```

Edit `backend/.env` and add:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your-firebase-project-id
```

**Place Firebase service account:**

Put your `firebase-service-account.json` in the `backend/` directory.  
See [docs/firebase-setup.md](docs/firebase-setup.md) for instructions.

### 5. Start Backend

```bash
uvicorn app.main:app --reload
```

Runs at **http://localhost:8000**  
API docs available at **http://localhost:8000/docs**

---

## Both Servers Running

| Server | URL |
|--------|-----|
| Frontend (React + Vite) | http://localhost:5173 |
| Backend (FastAPI) | http://localhost:8000 |
| Backend API Docs | http://localhost:8000/docs |

---

## Architecture

```
Frontend (React + Vite + TypeScript)
│
├── Firebase Auth  — user sign-in (Email / Google)
├── Camera         — capture images for analysis
├── API Service    — sends base64 image to backend
└── Museum         — displays saved discoveries

Backend (FastAPI + Python)
│
├── /api/discovery     — main AI analysis endpoint
├── PipOrchestrator    — coordinates agent pipeline
│   ├── SafetyAgent    — danger detection (blocking)
│   ├── SpecialistAgent — species identification (Botanist / Zoologist / Entomologist)
│   └── SupportAgent   — story + activity generation
└── Firestore          — persists discoveries for authenticated users
```

---

## Documentation

All guides are in the [`docs/`](docs/) folder:

| Guide | Description |
|-------|-------------|
| [firebase-setup.md](docs/firebase-setup.md) | Firebase project setup & frontend config |
| [google-auth.md](docs/google-auth.md) | Enabling Google Sign-In |
| [api-integration.md](docs/api-integration.md) | How the camera → backend AI pipeline works |
| [testing.md](docs/testing.md) | Full test scenarios for auth & persistence |
| [demo-guide.md](docs/demo-guide.md) | Feature overview for demos |
| [pwa.md](docs/pwa.md) | PWA installation & offline support |
| [security.md](docs/security.md) | Parental Dashboard security layers |
| [deployment.md](docs/deployment.md) | Docker & production deployment |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

---

## Environment Variables Summary

### Frontend (`.env` in project root)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_API_BASE_URL` | Backend URL (default: `http://localhost:8000`) |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key — get from [AI Studio](https://aistudio.google.com/app/apikey) |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |