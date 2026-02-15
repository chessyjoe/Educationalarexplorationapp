# Pip System Backend - Setup Guide

## Prerequisites
- Python 3.9+
- Google Cloud account with Gemini API access

## Installation

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Set Up Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID (optional for now)

3. **Run the Server**
```bash
# Development mode with auto-reload
uvicorn app.main:app --reload

# Or using the ADK web interface
adk web
```

4. **Test the API**
```bash
curl -X POST http://localhost:8000/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "child_id": "test_child",
    "media_type": "image",
    "media_data": "base64_string",
    "discovery_description": "I found a butterfly with orange wings!"
  }'
```

## Architecture

### Core Components
- **API Gateway** (`app/main.py`): FastAPI server
- **Orchestrator** (`app/orchestrator/`): Request coordination
- **Agents** (`app/agents/`): AI specialists
  - SafetyAgent: Checks for dangers
  - Specialists: Botanist, Entomologist, Zoologist
  - Support: Storyteller, Educator
- **Models** (`app/models/`): Data structures
- **Memory** (`app/memory/`): Persistence layer (WIP)

### Data Flow
1. Client sends discovery to `/api/discovery`
2. Orchestrator loads context
3. SafetyAgent checks for dangers (blocking)
4. Specialist agents identify species (parallel)
5. Support agents generate story and activity (parallel)
6. Response synthesized and returned

## Development

### Adding a New Agent
1. Create agent class in `app/agents/`
2. Import `get_gemini_client()` for LLM access
3. Register in `ExecutionCoordinator`
4. Update `AgentRouter` routing logic

### Testing with Real AI
Make sure `GEMINI_API_KEY` is set, then:
```bash
python -c "from app.agents.safety_agent import SafetyAgent; import asyncio; asyncio.run(SafetyAgent().evaluate_safety({'discovery_description': 'a red spider'}))"
```

## Next Steps
- [ ] Add Firestore integration for memory
- [ ] Implement vector database for semantic search
- [ ] Add authentication middleware
- [ ] Implement remaining API endpoints
