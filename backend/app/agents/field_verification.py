"""Field Verification agent — before/after inspection analysis (Phase 9).

Compares blockage and condition metrics before/after a maintenance action and
produces a verification verdict (VERIFIED / PARTIALLY VERIFIED / VERIFICATION
FAILED). Human override is always allowed and persisted.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import FieldInspection
from app.schemas import AgentStatus, FieldVerificationResponse
from app.services.ai_provider import AIProvider


class FieldVerificationAgent:
    """Analyzes inspection images and compares blockage/condition metrics."""

    name = "field_verification"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def verify(
        self,
        inspection_id: str,
        session: AsyncSession,
    ) -> FieldVerificationResponse:
        inspection = await session.get(FieldInspection, inspection_id)
        if not inspection:
            return FieldVerificationResponse(
                inspection_id=inspection_id,
                status=AgentStatus.FAILED,
                verification_status="VERIFICATION FAILED",
                findings=["Insufficient evidence: inspection record not found."],
                confidence=0.0,
                allow_human_override=True,
            )

        # Inspect the images with the AI provider (vision analysis)
        image_findings: list[str] = []
        if inspection.image_before:
            before_analysis = await self._ai.analyze_image(
                inspection.image_before, "Estimate drain blockage and debris in before image."
            )
            image_findings.extend(before_analysis.findings)
        if inspection.image_after:
            after_analysis = await self._ai.analyze_image(
                inspection.image_after, "Estimate drain blockage and debris in after image."
            )
            image_findings.extend(after_analysis.findings)

        blockage_before = inspection.blockage_before
        blockage_after = inspection.blockage_after
        condition_before = inspection.condition_before
        condition_after = inspection.condition_after

        findings: list[str] = []
        if image_findings:
            findings.extend(image_findings)

        # ------------------------------------------------------------------
        # Determine verdict from recorded metrics
        # ------------------------------------------------------------------
        if blockage_before is None or blockage_after is None:
            verdict = "VERIFICATION FAILED"
            confidence = 0.0
            findings.append("Insufficient evidence: missing blockage measurements.")
        else:
            reduction = (blockage_before - blockage_after) / max(blockage_before, 1)
            if reduction >= 0.7:
                verdict = "VERIFIED"
                confidence = 0.9
                findings.append(
                    f"Blockage reduced by {reduction * 100:.0f}% "
                    f"({blockage_before:.0f}% -> {blockage_after:.0f}%)."
                )
            elif reduction >= 0.3:
                verdict = "PARTIALLY VERIFIED"
                confidence = 0.65
                findings.append(
                    f"Blockage reduced by {reduction * 100:.0f}% — partial improvement."
                )
            else:
                verdict = "VERIFICATION FAILED"
                confidence = 0.4
                findings.append(
                    f"Blockage barely changed ({blockage_before:.0f}% -> {blockage_after:.0f}%)."
                )

        # Condition score trend
        if condition_before is not None and condition_after is not None:
            if condition_after > condition_before:
                findings.append(
                    f"Drain condition improved from {condition_before}/10 to {condition_after}/10."
                )
            else:
                findings.append(
                    f"Drain condition unchanged at {condition_after}/10."
                )

        # Persist AI verdict so the UI / commander can read it later
        inspection.verification_status = verdict.lower().replace(" ", "_")
        inspection.ai_verification_score = round(confidence, 2)
        await session.commit()

        return FieldVerificationResponse(
            inspection_id=inspection_id,
            status=AgentStatus.COMPLETED,
            verification_status=verdict,
            blockage_before=blockage_before,
            blockage_after=blockage_after,
            findings=findings,
            confidence=round(confidence, 2),
            allow_human_override=True,
        )