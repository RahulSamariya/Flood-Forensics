"""Tests for the AI provider abstraction (Phase 11)."""

import pytest

from app.services.ai_provider import (
    AnalysisResult,
    GraniteAIProvider,
    MockAIProvider,
    RecommendationItem,
)


@pytest.mark.asyncio
async def test_mock_generate_text():
    provider = MockAIProvider()
    result = await provider.generate_text("Analyze", {"event_id": "F2026-001"})
    assert "F2026-001" in result


@pytest.mark.asyncio
async def test_mock_analyze_evidence_no_evidence():
    provider = MockAIProvider()
    result = await provider.analyze_evidence("Finding", [])
    assert result.confidence == 0.0
    assert result.explanation == "Insufficient evidence."


@pytest.mark.asyncio
async def test_mock_analyze_evidence_confidence_scales():
    provider = MockAIProvider()
    result = await provider.analyze_evidence(
        "Finding",
        [{"source": "drains", "description": "71% blockage"}],
    )
    assert isinstance(result, AnalysisResult)
    assert result.confidence > 0.0


def test_factory_returns_mock_by_default():
    from app.services.ai_provider import get_ai_provider

    assert isinstance(get_ai_provider(), MockAIProvider)


def test_granite_recommend_parses_json(monkeypatch):
    provider = GraniteAIProvider("key", "project", "https://example.com", "model")

    async def fake_generate(self, prompt, max_new_tokens=512, temperature=0.2):
        return (
            '[{"title": "Desilt D142", "description": "Clear the drain", '
            '"estimated_cost": 49200, "expected_risk_reduction": 0.8, '
            '"priority": "high", "confidence": 0.9}]'
        )

    monkeypatch.setattr(GraniteAIProvider, "_generate", fake_generate)
    items = asyncio_run(provider.recommend({"zone": "J18"}))
    assert isinstance(items[0], RecommendationItem)
    assert items[0].title == "Desilt D142"
    assert items[0].estimated_cost == 49200


def test_granite_recommend_fallback_on_bad_json(monkeypatch):
    provider = GraniteAIProvider("key", "project", "https://example.com", "model")

    async def fake_generate(self, prompt, max_new_tokens=512, temperature=0.2):
        return "not json"

    monkeypatch.setattr(GraniteAIProvider, "_generate", fake_generate)
    items = asyncio_run(provider.recommend({"zone": "J18"}))
    assert len(items) == 1
    assert items[0].confidence == 0.5


def asyncio_run(coro):
    import asyncio

    return asyncio.run(coro)