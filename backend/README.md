# Pip System Backend — Setup Guide

## Prerequisites

- Python 3.9+
- Google Cloud account with Gemini API access
- Firebase project with a web app registered

---

## Installation

### 1. Create & Activate Virtual Environment

```bash
# macOS / Linux
python -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID

### 4. Add Firebase Service Account

Place your `firebase-service-account.json` in the `backend/` directory (same level as `requirements.txt`).

Download it from: **Firebase Console → Project Settings → Service Accounts → Generate New Private Key**

### 5. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload
```

API runs at **http://localhost:8000**  
Interactive docs at **http://localhost:8000/docs**

Optionally, use the ADK web interface:
```bash
adk web
```

---

## Testing the API

```bash
curl -X POST http://localhost:8000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "child_id": "test_child",
    "media_type": "image",
    "media_data": "base64_string_here",
    "discovery_description": "I found a butterfly with orange wings!"
  }'
```

Or open the Swagger UI at `http://localhost:8000/docs` for interactive testing.

---

## Docker

A `Dockerfile` is included for containerised deployment.

```bash
# Build
docker build -t pip-backend .

# Run
docker run -p 8000:8000 \
  -e GEMINI_API_KEY=your_key \
  -e FIREBASE_PROJECT_ID=your_project_id \
  pip-backend
```

> For full deployment instructions, see [../docs/deployment.md](../docs/deployment.md).

---

## Architecture

### Core Components

| Module | Path | Role |
|--------|------|------|
| API Gateway | `app/main.py` | FastAPI server, routes, middleware |
| Orchestrator | `app/orchestrator/` | Coordinates the agent pipeline |
| SafetyAgent | `app/agents/safety_agent.py` | Danger detection (blocking step) |
| SpecialistAgent | `app/agents/specialist_agent.py` | Species identification (Botanist/Zoologist/Entomologist) |
| SupportAgent | `app/agents/support_agent.py` | Story and activity generation |
| Auth | `app/auth/firebase_auth.py` | Firebase token verification middleware |
| Repositories | `app/repositories/` | Firestore data access (discoveries, users) |
| Models | `app/models/` | Pydantic data structures |
| Memory | `app/memory/` | Persistence layer |

### Agent Pipeline (Data Flow)

```
POST /api/discovery
  ↓
PipOrchestrator.process_discovery()
  ↓
SafetyAgent.evaluate_safety()     ← blocking, short-circuits on danger
  ↓
SpecialistAgent.identify()        ← parallel species identification
  ↓
SupportAgent.generate_story()     ← story + activities (parallel)
  ↓
Response synthesized
  ↓
If authenticated → DiscoveryRepository.save_discovery() → Firestore
```

---

## Development

### Adding a New Agent

1. Create agent class in `app/agents/`
2. Import `get_gemini_client()` for LLM access
3. Register in `ExecutionCoordinator`
4. Update `AgentRouter` routing logic

### Quick Agent Test

```bash
python -c "from app.agents.safety_agent import SafetyAgent; import asyncio; asyncio.run(SafetyAgent().evaluate_safety({'discovery_description': 'a red spider'}))"
```

---

## Completed Features

- [x] Firestore integration for discovery persistence
- [x] Firebase Authentication middleware
- [x] Token verification on protected endpoints
- [x] Discovery history & favorites endpoints
- [x] User repository with profile management
- [x] Agent pipeline (Safety → Specialist → Support)

## Roadmap

- [ ] Vector database for semantic search (similar discoveries)
- [ ] Firebase Storage for full-resolution discovery images
- [ ] Background sync for offline-captured discoveries
