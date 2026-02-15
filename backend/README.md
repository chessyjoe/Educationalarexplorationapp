# Pip Orchestrator Backend

This directory contains the Python backend for the Pip System, implementing the "Pip Orchestrator" and associated agents as described in the C4 architecture.

## Architecture

- **Framework**: FastAPI (API Gateway)
- **Agent Framework**: Google ADK
- **Database**: Firestore & Vector DB (TBD)

## Directory Structure

- `app/`: Main application code
  - `main.py`: Entry point
  - `orchestrator/`: Core logic (Context, Router, Synthesizer)
  - `agents/`: Agent implementations
  - `memory/`: Memory management
- `tests/`: Unit and integration tests
