"""Integration test for the F2026-001 end-to-end pipeline (Phase 12)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_commander_full_pipeline_events(client):
    """Commander orchestrates all agents for F2026-001."""
    response = await client.post(
        "/api/commander/analyze", json={"event_id": "F2026-001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["confidence"] > 0.0
    assert data["primary_cause"] == "drainage blockage"

    agents = {f["agent_name"] for f in data["agent_findings"]}
    assert {"event_reconstructor", "root_cause", "recurrence", "permanent_fix"} <= agents


@pytest.mark.asyncio
async def test_commander_nl_query_routes(client):
    """Natural-language queries resolve correctly."""
    response = await client.post(
        "/api/commander/analyze", json={"query": "Has J18 flooded before?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "J18" in data["recurrence_summary"]


@pytest.mark.asyncio
async def test_commander_priority_intervention(client):
    response = await client.post(
        "/api/commander/analyze", json={"query": "What should we fix first?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "desilt" in data["recommended_intervention"].lower()


@pytest.mark.asyncio
async def test_root_cause_agent_endpoint(client):
    response = await client.post(
        "/api/agents/root-cause", json={"event_id": "F2026-001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["ranked_causes"][0]["cause"] == "drainage_blockage"


@pytest.mark.asyncio
async def test_recurrence_agent_endpoint(client):
    response = await client.post(
        "/api/agents/recurrence", json={"event_id": "F2026-001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["similar_events"][0]["event_id"] == "F2025-003"


@pytest.mark.asyncio
async def test_permanent_fix_agent_endpoint(client):
    response = await client.post(
        "/api/agents/permanent-fix", json={"event_id": "F2026-001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert len(data["immediate_response"]) > 0
    assert len(data["permanent_interventions"]) > 0


@pytest.mark.asyncio
async def test_field_verification_endpoint(client):
    response = await client.post(
        "/api/agents/field-verification", json={"inspection_id": "I-3001"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["verification_status"] in {"VERIFIED", "PENDING"}


@pytest.mark.asyncio
async def test_reconstruct_pipeline(client):
    response = await client.post("/api/events/F2026-001/reconstruct", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["event_id"] == "F2026-001"
    assert len(data["timeline"]) > 0