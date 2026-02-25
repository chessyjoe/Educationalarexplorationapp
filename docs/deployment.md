# Deployment Guide

This guide covers deploying the Pocket Science app to production using Docker (backend) and a static hosting platform (frontend).

---

## Overview

| Component | Recommended Platform |
|-----------|---------------------|
| Frontend (React + Vite) | Vercel, Netlify, Firebase Hosting |
| Backend (FastAPI) | Google Cloud Run, Fly.io, Railway |

---

## Frontend Deployment

### 1. Build for Production

```bash
npm run build
```

Outputs to `dist/`. This folder is what you deploy.

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in the Vercel dashboard (all `VITE_FIREBASE_*` + `VITE_API_BASE_URL` pointing to your deployed backend URL).

### 3. Deploy to Netlify

```bash
netlify deploy --prod --dir dist
```

### 4. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

---

## Backend Deployment (Docker)

A `Dockerfile` is included in the `backend/` directory.

### Build the Image

```bash
cd backend
docker build -t pip-backend .
```

### Run Locally with Docker

```bash
docker run -p 8000:8000 \
  -e GEMINI_API_KEY=your_key_here \
  -e FIREBASE_PROJECT_ID=your-project-id \
  -v $(pwd)/firebase-service-account.json:/app/firebase-service-account.json \
  pip-backend
```

> **Windows PowerShell:** Replace `$(pwd)` with `${PWD}` or use the full absolute path.

API will be available at **http://localhost:8000**

---

## Deploy Backend to Google Cloud Run

Cloud Run is the recommended production platform — it scales to zero and handles spikes automatically.

### 1. Authenticate & Configure

```bash
gcloud auth login
gcloud config set project your-project-id
```

### 2. Build & Push to Container Registry

```bash
cd backend
gcloud builds submit --tag gcr.io/your-project-id/pip-backend
```

### 3. Deploy

```bash
gcloud run deploy pip-backend \
  --image gcr.io/your-project-id/pip-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,FIREBASE_PROJECT_ID=your_project_id
```

### 4. Upload Firebase Service Account

Store `firebase-service-account.json` as a **Secret Manager** secret and mount it in the Cloud Run configuration, rather than bundling it in the image.

---

## Deploy Backend to Fly.io

```bash
cd backend
flyctl launch
flyctl secrets set GEMINI_API_KEY=your_key FIREBASE_PROJECT_ID=your_project_id
flyctl deploy
```

---

## Production Checklist

Before going live:

- [ ] Update `VITE_API_BASE_URL` in frontend `.env` to the deployed backend URL
- [ ] Update CORS `allow_origins` in `backend/app/main.py` from `"*"` to your frontend domain
- [ ] Set all `VITE_FIREBASE_*` variables in your hosting platform
- [ ] Set `GEMINI_API_KEY` and `FIREBASE_PROJECT_ID` in your backend hosting platform
- [ ] Confirm `firebase-service-account.json` is available to the backend (not committed to git)
- [ ] Configure Firestore security rules to restrict user data access
- [ ] Enable Firebase App Check for production

---

## Environment Variables — Production

### Frontend (set in Vercel / Netlify / Firebase Hosting dashboard)

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | From Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From Firebase Console |
| `VITE_FIREBASE_APP_ID` | From Firebase Console |
| `VITE_API_BASE_URL` | Your deployed backend URL (e.g., `https://pip-backend-xxxxx.run.app`) |

### Backend (set as env vars in Cloud Run / Fly.io / Railway)

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
