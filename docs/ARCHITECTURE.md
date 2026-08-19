# Flood Forensics — System Architecture

## Purpose

Flood Forensics is a **monolithic MVP** with a clear separation between frontend, backend, and data layers. It is **not** a microservices architecture. Six AI agents run as modular Python services within a single FastAPI application.

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                              │
│  Dashboard │ Investigation │ Map │ Recurrence │ Fixes │ Verification   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ REST API
┌───────────────────────────────▼─────────────────────────────────────────┐
│                         BACKEND (FastAPI)                               │
│  ┌─────────────┐  ┌──────────────────────────────────────────────────┐  │
│  │ API Layer   │  │ Agent Services                                   │  │
│  │ /api/events │  │ event_reconstructor │ root_cause │ recurrence    │  │
│  │ /api/agents │  │ permanent_fix │ field_verification │ commander   │  │
│  └─────────────┘  └──────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌──────────────────────────────────────────────────┐  │
│  │ Services    │  │ AI Provider Abstraction                          │  │
│  │ DB, Storage │  │ MockAIProvider │ GraniteAIProvider               │  │
│  └─────────────┘  └──────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                    Supabase (PostgreSQL + PostGIS)                      │
│  flood_events │ rainfall │ drains │ maintenance │ agent_findings │ ...  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Agent Pipeline

The **Urban Resilience Commander** orchestrates specialized agents. Agents do **not** invent facts — every finding includes evidence, confidence, and source references.

```
Flood Event (F2026-001)
        │
        ▼
┌───────────────────┐
│ Event Reconstructor│ → Timeline, affected locations, severity
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Root Cause Agent   │ → Ranked causes with evidence
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Recurrence Agent   │ → Flood DNA, similar events
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Permanent Fix Agent│ → Interventions, cost vs impact
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Field Verification │ → Before/after image analysis
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Commander          │ → Incident brief, resilience score, NL queries
└───────────────────┘
```

## Backend Module Layout

```
backend/app/
├── main.py              # FastAPI app, CORS, lifespan
├── api/                 # HTTP route handlers
├── agents/              # Six agent implementations
├── services/            # AI provider, DB helpers, analysis
├── models/              # SQLAlchemy ORM models
├── schemas/             # Pydantic request/response schemas
├── core/                # Config, database, security, exceptions
└── utils/               # Shared helpers (geo, time, evidence)
```

## AI Provider Abstraction

```python
class AIProvider(Protocol):
    async def generate_text(prompt: str, context: dict) -> str
    async def analyze_evidence(finding: str, evidence: list) -> AnalysisResult
    async def analyze_image(image_url: str, prompt: str) -> ImageAnalysisResult
    async def summarize(text: str, max_tokens: int) -> str
    async def recommend(context: dict) -> list[Recommendation]
```

- **MockAIProvider**: Deterministic, evidence-grounded responses for local dev
- **GraniteAIProvider**: IBM watsonx integration (Phase 11)

Switch via `AI_PROVIDER=mock|granite` in environment.

## Database Schema (14 tables)

| Table | Purpose |
|-------|---------|
| `flood_events` | Core flood incident records |
| `rainfall` | Station rainfall time series |
| `water_levels` | River/drain water level readings |
| `drains` | Drainage network nodes |
| `drain_connections` | Network graph edges |
| `maintenance_records` | Drain maintenance history |
| `citizen_reports` | Crowdsourced flood reports |
| `field_inspections` | Before/after verification |
| `roads` | Road network with flood thresholds |
| `response_actions` | Emergency response log |
| `damage_reports` | Infrastructure damage |
| `agent_runs` | Agent execution audit trail |
| `agent_findings` | Structured agent outputs |
| `recommendations` | Permanent fix proposals |

PostGIS `GEOGRAPHY(POINT)` used for location fields where applicable.

## Frontend Page Map

| Route | Purpose |
|-------|---------|
| `/` | Command center dashboard |
| `/events/[id]` | Flood event investigation |
| `/map` | Layered geospatial view |
| `/recurrence` | Flood DNA and similar events |
| `/fixes` | Permanent intervention recommendations |
| `/verification` | Field inspection workflow |
| `/agents` | Agent console and pipeline status |

## API Contract (Planned)

| Method | Endpoint | Phase |
|--------|----------|-------|
| GET | `/api/events` | 3 |
| GET | `/api/events/{event_id}` | 3 |
| POST | `/api/events/{event_id}/reconstruct` | 5 |
| POST | `/api/agents/root-cause` | 6 |
| POST | `/api/agents/recurrence` | 7 |
| POST | `/api/agents/permanent-fix` | 8 |
| POST | `/api/agents/field-verification` | 9 |
| POST | `/api/commander/analyze` | 10 |
| GET | `/api/drains` | 3 |
| GET | `/api/roads` | 3 |
| GET | `/api/recommendations` | 3 |
| POST | `/api/field-inspections` | 9 |

## Deployment

| Component | Target |
|-----------|--------|
| Frontend | Vercel |
| Backend | Railway, Render, or container host |
| Database | Supabase managed PostgreSQL |

## Design Principles

1. **Evidence-first AI** — No fabricated findings; "Insufficient evidence" when data is missing
2. **Demo data transparency** — All seed data labeled DEMO/SIMULATED
3. **Provider-agnostic AI** — Clean abstraction, no hard-coded provider logic in agents
4. **Municipal UX** — Dark, information-dense command center aesthetic
5. **Incremental delivery** — Phase-by-phase with tests after each phase
