"""Urban Resilience Commander endpoints (Phase 10)."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.commander import UrbanResilienceCommander
from app.core.database import get_db
from app.schemas import CommanderAnalyzeRequest, CommanderAnalyzeResponse

router = APIRouter()


@router.post("/analyze", response_model=CommanderAnalyzeResponse)
async def commander_analyze(
    body: CommanderAnalyzeRequest,
    session: AsyncSession = Depends(get_db),
) -> CommanderAnalyzeResponse:
    commander = UrbanResilienceCommander()
    return await commander.analyze(
        event_id=body.event_id,
        query=body.query,
        session=session,
    )