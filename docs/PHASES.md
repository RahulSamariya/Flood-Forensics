# Development Phases

## Phase 1 — Architecture & Repository Structure ✅

**Goal:** Establish monorepo layout, tooling, skeleton code, and documentation.

**Deliverables:**
- [x] Directory structure (`frontend/`, `backend/`, `supabase/`, `data/`, `docs/`)
- [x] FastAPI skeleton with health check and API router stubs
- [x] Next.js shell with layout and route placeholders
- [x] AI provider interface (Mock + Granite stub)
- [x] `.env.example`, `.gitignore`, `README.md`
- [x] Architecture documentation

**Verification:**
```bash
cd backend && pip install -r requirements.txt && pytest
cd frontend && npm install && npm run build
```

---

## Phase 2 — Database Schema & Seed Data ⏳

**Goal:** PostGIS-enabled Supabase schema and F2026-001 demo dataset.

**Deliverables:**
- SQL migrations for all 14 tables
- Seed script for F2026-001 (rainfall spike, drain blockage, citizen report, etc.)
- Data files in `data/` directories

---

## Phase 3 — FastAPI Backend & DB Connection ⏳

**Goal:** SQLAlchemy models, Supabase connection, CRUD endpoints.

**Deliverables:**
- `GET /api/events`, `GET /api/events/{id}`
- `GET /api/drains`, `GET /api/roads`, `GET /api/recommendations`
- Pydantic schemas matching DB tables

---

## Phase 4 — Frontend Shell & Dashboard ⏳

**Goal:** Command center UI with map, incident summary, commander panel.

**Deliverables:**
- Dark professional dashboard layout
- Mapbox integration (layer toggles stubbed)
- API client with loading/error states

---

## Phase 5 — Event Reconstructor ⏳

**Goal:** Timeline reconstruction from multi-source evidence.

**Deliverables:**
- `POST /api/events/{event_id}/reconstruct`
- Timeline UI with replay control

---

## Phase 6 — Root Cause Agent ⏳

**Goal:** Ranked causal analysis with evidence/contradictions.

**Deliverables:**
- `POST /api/agents/root-cause`
- Causal chain visualization

---

## Phase 7 — Recurrence Agent ⏳

**Goal:** Flood DNA profiles and similar event search.

**Deliverables:**
- `POST /api/agents/recurrence`
- Recurrence page with historical comparison

---

## Phase 8 — Permanent Fix Agent ⏳

**Goal:** Intervention recommendations with cost vs impact.

**Deliverables:**
- `POST /api/agents/permanent-fix`
- Fixes page with Recharts comparison

---

## Phase 9 — Field Verification ⏳

**Goal:** Before/after image analysis with human override.

**Deliverables:**
- `POST /api/agents/field-verification`
- `POST /api/field-inspections`
- Verification workflow UI

---

## Phase 10 — Urban Resilience Commander ⏳

**Goal:** Orchestration, incident brief, natural-language queries.

**Deliverables:**
- `POST /api/commander/analyze`
- "Ask the City" interface
- Resilience score computation

---

## Phase 11 — IBM Granite Integration ⏳

**Goal:** Production AI provider via watsonx.

**Deliverables:**
- Full `GraniteAIProvider` implementation
- Environment-based provider switching

---

## Phase 12 — Testing, Polish & Deployment ⏳

**Goal:** End-to-end demo readiness.

**Deliverables:**
- Integration tests for F2026-001 pipeline
- Vercel + backend deployment configs
- Demo script for hackathon presentation
