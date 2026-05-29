"""
routes/analytics.py

Analytics API endpoints — system behavior logging, telemetry, and velocity engines.

Endpoints:
  POST /analytics/track    Ingest a telemetry event stream packet (asynchronous)
  GET  /trending           Extract current high-velocity knowledge trends
"""

from fastapi import APIRouter, BackgroundTasks, status, Body
from typing import Annotated, List

from app.core.dependencies import AnalyticsServiceDep, SettingsDep
from app.core.logging import get_logger
from app.schemas.analytics import TrackEventSchema, TrendingConceptResponse

router = APIRouter(tags=["Analytics Engine"])
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# POST /analytics/track
# ---------------------------------------------------------------------------

@router.post(
    "/analytics/track",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Ingest user interaction telemetry",
    description="Non-blocking fire-and-forget logging hook processing exploration paths for algorithmic ranking optimization.",
)
async def track_event(
    event: Annotated[TrackEventSchema, Body(description="Exploration action payload details")],
    background_tasks: BackgroundTasks,
    analytics_svc: AnalyticsServiceDep = None,
    settings: SettingsDep = None,
):
    if not settings.ANALYTICS_ENABLED:
        return {"status": "telemetry_disabled"}

    logger.debug("analytics.track.request", event_type=event.event_type)
    
    # Fully offloaded tracking to protect fast UX response loops
    background_tasks.add_task(analytics_svc.log_event, event)
    
    return {"status": "event_queued"}


# ---------------------------------------------------------------------------
# GET /trending
# ---------------------------------------------------------------------------

@router.get(
    "/trending",
    response_model=List[TrendingConceptResponse],
    summary="Retrieve high-velocity exploration topics",
    description="Aggregates system-wide query telemetry over a sliding time-window to expose trending concepts.",
)
async def get_trending_concepts(
    analytics_svc: AnalyticsServiceDep = None,
    settings: SettingsDep = None,
) -> List[TrendingConceptResponse]:
    logger.debug("analytics.trending.request")
    
    trends = await analytics_svc.calculate_trending(
        time_window_hours=settings.TRENDING_WINDOW_HOURS,
        limit=settings.TRENDING_LIMIT
    )
    return trends