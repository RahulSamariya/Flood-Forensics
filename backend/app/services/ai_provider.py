"""AI provider abstraction — Mock and Granite implementations."""

import json
from abc import ABC, abstractmethod
from typing import Any

import httpx
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
    Uses the watsonx.ai text generation endpoint (text/generation v1).
    Requires WATSONX_API_KEY and WATSONX_PROJECT_ID.
    """

    def __init__(
        self,
        api_key: str,
        project_id: str,
        url: str,
        model: str,
        vision_model: str | None = None,
    ) -> None:
        self._api_key = api_key
        self._project_id = project_id
        self._url = url.rstrip("/")
        self._model = model
        self._vision_model = vision_model or model

    def _endpoint(self) -> str:
        return f"{self._url}/ml/v1/text/generation"

    async def _generate(
        self, prompt: str, max_new_tokens: int = 512, temperature: float = 0.2
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model_id": self._model,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": max_new_tokens,
                "temperature": temperature,
            },
            "project_id": self._project_id,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self._endpoint(), headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
        results = data.get("results") or []
        if not results:
            return ""
        return results[0].get("generated_text", "").strip()

    async def generate_text(self, prompt: str, context: dict[str, Any] | None = None) -> str:
        return await self._generate(prompt)

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
        evidence_lines = "\n".join(
            f"- {item.get('source', 'unknown')}: {item.get('description', str(item))}"
            for item in evidence
        )
        prompt = (
            f"Given the finding below and supporting evidence, provide a concise "
            f"assessment and a confidence score (0.0-1.0) as JSON.\n\n"
            f"Finding: {finding}\n\nEvidence:\n{evidence_lines}\n\n"
            f'Respond with JSON: {{"explanation": "...", "confidence": 0.0}}'
        )
        raw = await self._generate(prompt, max_new_tokens=256)
        try:
            parsed = json.loads(raw.strip("`").strip().lstrip("json"))
            confidence = max(0.0, min(1.0, float(parsed.get("confidence", 0.5))))
            explanation = str(parsed.get("explanation", raw))
        except (json.JSONDecodeError, ValueError, TypeError):
            confidence = 0.5
            explanation = raw or "Granite analysis completed."
        return AnalysisResult(
            finding=finding,
            evidence=evidence,
            confidence=confidence,
            explanation=explanation,
        )

    async def analyze_image(self, image_url: str, prompt: str) -> ImageAnalysisResult:
        # Granite vision models (e.g. ibm/granite-vision-3-4) are served via the
        # separate vision endpoint. When configured, call it; otherwise return a
        # deterministic placeholder so agents still consume a PENDING result.
        if self._vision_model != self._model:
            headers = {
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model_id": self._vision_model,
                "input": prompt,
                "parameters": {
                    "decoding_method": "greedy",
                    "max_new_tokens": 256,
                },
                "project_id": self._project_id,
            }
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{self._url}/ml/v1/text/generation",
                        headers=headers,
                        json=payload,
                    )
                    response.raise_for_status()
                    data = response.json()
                results = data.get("results") or []
                if results:
                    text = results[0].get("generated_text", "")
                    return ImageAnalysisResult(
                        findings=[text.strip()],
                        metrics={"blockage_percent_estimate": 0},
                        confidence=0.5,
                        verification_status="PENDING",
                    )
            except httpx.HTTPError:
                pass
        return ImageAnalysisResult(
            findings=[
                "Image analysis requires a Granite vision-capable model "
                "(e.g. ibm/granite-vision-3-4) via the vision endpoint."
            ],
            metrics={"blockage_percent_estimate": 0},
            confidence=0.0,
            verification_status="PENDING",
        )

    async def summarize(self, text: str, max_tokens: int = 512) -> str:
        prompt = (
            f"Summarize the following incident analysis in under "
            f"{max_tokens} tokens:\n\n{text}"
        )
        return await self._generate(prompt, max_new_tokens=max_tokens)

    async def recommend(self, context: dict[str, Any]) -> list[RecommendationItem]:
        prompt = (
            "Given the flood incident context, recommend concrete interventions. "
            'Respond with JSON array of objects: [{"title": "...", '
            '"description": "...", "estimated_cost": 0, '
            '"expected_risk_reduction": 0.0, "priority": "high", "confidence": 0.0}]\n\n'
            f"Context:\n{json.dumps(context, indent=2)}"
        )
        raw = await self._generate(prompt, max_new_tokens=512)
        try:
            items = json.loads(raw.strip("`").strip().lstrip("json"))
            if not isinstance(items, list):
                items = []
        except (json.JSONDecodeError, ValueError, TypeError):
            items = []
        results: list[RecommendationItem] = []
        for item in items[:5]:
            try:
                results.append(
                    RecommendationItem(
                        title=str(item.get("title", "Intervention")),
                        description=str(item.get("description", "")),
                        estimated_cost=item.get("estimated_cost"),
                        expected_risk_reduction=item.get("expected_risk_reduction"),
                        priority=str(item.get("priority", "medium")),
                        confidence=max(
                            0.0, min(1.0, float(item.get("confidence", 0.5)))
                        ),
                    )
                )
            except (ValueError, TypeError):
                continue
        if not results:
            # Deterministic fallback so agents always get a recommendation.
            return [
                RecommendationItem(
                    title="Review drainage maintenance schedule",
                    description="Granite did not return structured interventions; review schedule.",
                    estimated_cost=50000.0,
                    expected_risk_reduction=0.25,
                    priority="high",
                    confidence=0.5,
                )
            ]
        return results


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
            vision_model=settings.watsonx_vision_model,
        )
    return MockAIProvider()
