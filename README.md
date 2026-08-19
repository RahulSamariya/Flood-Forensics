# Flood Forensics

Agentic urban flood investigation and resilience platform for municipal emergency and intelligence operations.

## Overview

Flood Forensics investigates flooding **after or during** an event and answers:

1. What happened?
2. Why did it happen?
3. Has this happened before?
4. What permanent intervention should be made?
5. Did the intervention actually work?
6. What should the city do next?

**Core pipeline:** Flood Event → Event Reconstruction → Root Cause → Recurrence Analysis → Permanent Fix → Field Verification → Urban Resilience Improvement

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Mapbox GL, Recharts |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| Database | Supabase PostgreSQL + PostGIS |
| AI | Provider abstraction (Mock / IBM watsonx Granite) |
| Analysis | Pandas, NumPy, GeoPandas, NetworkX |

## Project Structure

```
flood-forensics/
├── frontend/          # Next.js command center UI
├── backend/           # FastAPI + agent services
├── supabase/          # Migrations and seed data
├── data/              # Demo/simulated datasets
└── docs/              # Architecture and phase documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account (optional for Phase 3+)
- Mapbox token (optional for map layers)

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

Dashboard: [http://localhost:3000](http://localhost:3000)

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ | Architecture and repository structure |
| 2 | ⏳ | Database schema and seed data |
| 3 | ⏳ | FastAPI backend and DB connection |
| 4 | ⏳ | Frontend shell and dashboard |
| 5–10 | ⏳ | Agent implementations |
| 11 | ⏳ | IBM Granite integration |
| 12 | ⏳ | Testing, polish, deployment |

See [docs/PHASES.md](docs/PHASES.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Demo Event

The canonical demonstration event is **F2026-001** — a fully consistent simulated flood scenario with rainfall, drainage blockage, citizen reports, and field verification data. All demo data is clearly labeled **DEMO/SIMULATED**.

## Security

- Secrets live in `.env` only (see `.env.example`)
- Supabase service-role key is **backend-only**
- AI provider keys never reach the frontend
- Basic API key authentication structure included

## License

Hackathon project — internal demonstration use.
