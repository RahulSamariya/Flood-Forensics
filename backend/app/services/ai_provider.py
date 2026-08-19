"""AI provider abstraction — Mock and Granite implementations."""

from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    finding: str
    evidence: list[dict[str, Any]] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str = ""


class ImageAnalysisResult(BaseModel):
    findings: list[str] = Field(default_factory=list)
    metrics: dict[str, float | int] = Field(default_factory=dict)
    confidence: float = Field(ge=0.0, le=1.0)
    verification_status: str = "PENDING"


class RecommendationItem(BaseModel):
    title: str
    description: str
    estimated_cost: float | None = None
    expected_risk_reduction: float | None = None
    priority: str = "medium"
    confidence: float = Field(ge=0.0, le=1.0, default=0.5)


class AIProvider(ABC):
    """Provider-agnostic AI interface for all agents."""

    @abstractmethod
    async def generate_text(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        ...

    @abstractmethod
    async def analyze_evidence(
        self,
        finding: str,
        evidence: list[dict[str, Any]],
    ) -> AnalysisResult:
        ...

    @abstractmethod
    async def analyze_image(self, image_url: str, prompt: str) -> ImageAnalysisResult:
        ...

    @abstractmethod
    async def summarize(self, text: str, max_tokens: int = 512) -> str:
        ...

    @abstractmethod
    async def recommend(self, context: dict[str, Any]) -> list[RecommendationItem]:
        ...


class MockAIProvider(AIProvider):
    """
    Deterministic mock provider for local development.
    Does not fabricate evidence — returns structured placeholders
    that agents populate with real data.
    """

    async def generate_text(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        ctx = context or {}
        event_id = ctx.get("event_id", "unknown")
        return (
            f"[MOCK AI] Analysis for event {event_id}. "
            "Connect Granite provider (AI_PROVIDER=granite) for LLM-generated summaries."
        )

    async def analyze_evidence(
        self,
        finding: str,
        evidence: list[dict[str, Any]],
    ) -> AnalysisResult:
        if not evidence:
            return AnalysisResult(
                finding=finding,
                evidence=[],
                confidence=0.0,
                explanation="Insufficient evidence.",
            )
        confidence = min(0.95, 0.4 + 0.1 * len(evidence))
        return AnalysisResult(
            finding=finding,
            evidence=evidence,
            confidence=confidence,
            explanation=f"Mock analysis based on {len(evidence)} evidence item(s).",
        )

    async def analyze_image(self, image_url: str, prompt: str) -> ImageAnalysisResult:
        return ImageAnalysisResult(
            findings=["Mock image analysis — connect Granite for vision capabilities."],
            metrics={"blockage_percent_estimate": 0},
            confidence=0.0,
            verification_status="PENDING",
        )

    async def summarize(self, text: str, max_tokens: int = 512) -> str:
        truncated = text[: max_tokens * 4]
        return f"[MOCK SUMMARY] {truncated[:200]}..."

    async def recommend(self, context: dict[str, Any]) -> list[RecommendationItem]:
        return [
            RecommendationItem(
                title="Review drainage maintenance schedule",
                description="Mock recommendation — agents will supply data-driven interventions.",
                estimated_cost=50000.0,
                expected_risk_reduction=0.25,
                priority="high",
                confidence=0.5,
            )
        ]


class GraniteAIProvider(AIProvider):
    """
    IBM watsonx / Granite provider (Phase 11).
    Requires WATSONX_API_KEY and WATSONX_PROJECT_ID.
    """

    def __init__(self, api_key: str, project_id: str, url: str, model: str) -> None:
        self._api_key = api_key
        self._project_id = project_id
        self._url = url
        self._model = model

    async def generate_text(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        raise NotImplementedError("Granite provider will be implemented in Phase 11.")

    async def analyze_evidence(
        self,
        finding: str,
        evidence: list[dict[str, Any]],
    ) -> AnalysisResult:
        raise NotImplementedError("Granite provider will be implemented in Phase 11.")

    async def analyze_image(self, image_url: str, prompt: str) -> ImageAnalysisResult:
        raise NotImplementedError("Granite provider will be implemented in Phase 11.")

    async def summarize(self, text: str, max_tokens: int = 512) -> str:
        raise NotImplementedError("Granite provider will be implemented in Phase 11.")

    async def recommend(self, context: dict[str, Any]) -> list[RecommendationItem]:
        raise NotImplementedError("Granite provider will be implemented in Phase 11.")


def get_ai_provider() -> AIProvider:
    """Factory: returns Mock or Granite provider based on AI_PROVIDER env."""
    from app.core.config import get_settings

    settings = get_settings()
    if settings.ai_provider == "granite":
        if not settings.watsonx_api_key or not settings.watsonx_project_id:
            raise ValueError(
                "Granite provider requires WATSONX_API_KEY and WATSONX_PROJECT_ID."
            )
        return GraniteAIProvider(
            api_key=settings.watsonx_api_key,
            project_id=settings.watsonx_project_id,
            url=settings.watsonx_url,
            model=settings.watsonx_model,
        )
    return MockAIProvider()
