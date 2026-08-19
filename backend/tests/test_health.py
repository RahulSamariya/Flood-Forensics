"""Health check and API smoke tests."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["ai_provider"] == "mock"


@pytest.mark.asyncio
async def test_list_events_seeded(client):
    response = await client.get("/api/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 1
    assert events[0]["event_id"] == "F2026-001"
    assert events[0]["source"] == "DEMO"


@pytest.mark.asyncio
async def test_get_event_detail(client):
    response = await client.get("/api/events/F2026-001")
    assert response.status_code == 200
    data = response.json()
    assert data["event_id"] == "F2026-001"
    assert data["city"] == "Chennai"
    assert data["zone_id"] == "J18"


@pytest.mark.asyncio
async def test_list_drains(client):
    response = await client.get("/api/drains")
    assert response.status_code == 200
    drains = response.json()
    assert any(d["drain_id"] == "D142" for d in drains)


@pytest.mark.asyncio
async def test_event_reconstruct_pipeline(client):
    response = await client.post("/api/events/F2026-001/reconstruct", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["event_id"] == "F2026-001"


@pytest.mark.asyncio
async def test_commander_analyze_requires_input(client):
    response = await client.post("/api/commander/analyze", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "failed"
