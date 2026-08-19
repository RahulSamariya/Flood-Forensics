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
async def test_list_events_empty(client):
    response = await client.get("/api/events")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_commander_analyze_requires_input(client):
    response = await client.post("/api/commander/analyze", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "failed"
