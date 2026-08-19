"""Urban Resilience Commander endpoints (Phase 10)."""

from fastapi import APIRouter

from app.agents.commander import UrbanResilienceCommander
from app.schemas import CommanderAnalyzeRequest, CommanderAnalyzeResponse

router = APIRouter()


@router.post("/analyze", response_model=CommanderAnalyzeResponse)
async def commander_analyze(body: CommanderAnalyzeRequest) -> CommanderAnalyzeResponse:
    commander = UrbanResilienceCommander()
    return await commander.analyze(event_id=body.event_id, query=body.query)
