"""Agent endpoints (Phases 5–9)."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.field_verification import FieldVerificationAgent
from app.agents.permanent_fix import PermanentFixAgent
from app.agents.recurrence import RecurrenceAgent
from app.agents.root_cause import RootCauseAgent
from app.core.database import get_db
from app.schemas import (
    FieldVerificationRequest,
    FieldVerificationResponse,
    PermanentFixRequest,
    PermanentFixResponse,
    RecurrenceRequest,
    RecurrenceResponse,
    RootCauseRequest,
    RootCauseResponse,
)
from app.services.ai_provider import get_ai_provider

router = APIRouter()


@router.post("/root-cause", response_model=RootCauseResponse)
async def analyze_root_cause(
    body: RootCauseRequest,
    session: AsyncSession = Depends(get_db),
) -> RootCauseResponse:
    agent = RootCauseAgent(get_ai_provider())
    return await agent.analyze(body.event_id, session)


@router.post("/recurrence", response_model=RecurrenceResponse)
async def analyze_recurrence(
    body: RecurrenceRequest,
    session: AsyncSession = Depends(get_db),
) -> RecurrenceResponse:
    agent = RecurrenceAgent(get_ai_provider())
    return await agent.analyze(body.event_id, session)


@router.post("/permanent-fix", response_model=PermanentFixResponse)
async def analyze_permanent_fix(
    body: PermanentFixRequest,
    session: AsyncSession = Depends(get_db),
) -> PermanentFixResponse:
    agent = PermanentFixAgent(get_ai_provider())
    return await agent.analyze(body.event_id, session)


@router.post("/field-verification", response_model=FieldVerificationResponse)
async def verify_field_inspection(body: FieldVerificationRequest) -> FieldVerificationResponse:
    agent = FieldVerificationAgent(get_ai_provider())
    return await agent.verify(body.inspection_id)
