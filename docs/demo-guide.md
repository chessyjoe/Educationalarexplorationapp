# Pocket Science — Demo Guide

## Overview

Pocket Science is an AI-powered educational app for children aged 6–9. Kids point their camera at plants, insects, animals, and other natural objects. A multi-agent AI pipeline (powered by Google Gemini) identifies the species, checks for safety, generates an age-appropriate story, and saves the discovery to a personal museum — all in seconds.

---

## How It Works (Real AI Pipeline)

```
Camera Capture
     ↓
Base64 image sent to FastAPI backend (localhost:8000)
     ↓
SafetyAgent  →  checks for dangerous species (blocking step)
     ↓
SpecialistAgent  →  identifies species (Botanist / Zoologist / Entomologist)
     ↓
SupportAgent  →  generates story + follow-up activities
     ↓
Response returned to frontend
     ↓
Discovery saved to Firestore (if user is signed in)
```

---

## Core Features

### 1. Welcome Screen
- Animated Pip mascot greeting
- Quick access to Camera and Museum
- Badge counter showing achievements
- Sign In / user avatar in top-right corner

### 2. AR Camera Interface
- Live camera feed from device camera
- Target reticle with focus assist
- Pip provides real-time guidance
- "Tap to Snap" capture button

### 3. AI Recognition & Results
- Real-time species identification via Gemini AI
- Common name + scientific name
- Safety warning if dangerous (e.g. poison ivy, venomous insects)
- Age-appropriate storytelling narrated by Pip
- Fun facts and suggested follow-up activities
- Text-to-speech narration (Web Speech API)

### 4. Curiosity Board (Digital Museum)
- Visual card-based collection of saved discoveries
- 4 sorting modes: Date, Type, Color, Habitat
- Badge progress tracking
- Tap cards for full detail view
- Favorites toggle (heart icon)

### 5. Parental Dashboard (Sign-In Required)
- Protected by Firebase Authentication (Google or Email/Password)
- User profile and child account management
- Activity statistics and discovery history
- Privacy & safety information
- Data management controls

---

## Gamification

**Badges:**
| Badge | Condition |
|-------|-----------|
| 🪲 Beetle Boss | Find 5 insects |
| 🌳 Tree Hugger | Discover 3 trees |
| 🌸 Flower Power | Collect 5 flowers |
| 🐦 Bird Watcher | Spot 3 birds |
| 🔍 Curious Collector | Find 10 total discoveries |
| 🌈 Rainbow Explorer | Collect 5 different colors |

---

## Authentication & Data

- **Guest users** — can use the camera and see results, but discoveries are not saved
- **Signed-in users** — discoveries auto-save to Firestore, full museum access, Parental Dashboard
- **Sign-in methods** — Email/Password or Google OAuth (no PIN)

---

## Safety Features

- **AI Safety Check** — every discovery is screened by the SafetyAgent before displaying results
- **Visual Danger Warning** — red alert shown for hazardous items with parent guidance
- **Firebase Auth Protection** — Parental Dashboard requires authentication
- **No Location Tracking** — GPS data is never collected or stored

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| AI | Google Gemini (via FastAPI backend) |
| TTS | Web Speech API |
| PWA | Service Worker + Web App Manifest |

---

## Running the Demo

1. Start the backend: `cd backend && uvicorn app.main:app --reload`
2. Start the frontend: `npm run dev`
3. Open **http://localhost:5173**
4. Sign in with Google or Email to enable full discovery saving
5. Use the camera to scan any natural object

> For full setup instructions, see the [root README](../README.md).

---

## Future Enhancements (Post-MVP)

- **Phase 2**: Device-to-device discovery sharing
- **Phase 3**: Seasonal challenges and teacher mode
- **Phase 4**: Offline AI using on-device models
- **Phase 5**: Firebase Storage for full-resolution discovery images
- **Phase 6**: Push notifications for badge achievements
