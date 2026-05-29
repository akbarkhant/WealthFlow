"""
routes/problems.py

Content Engine endpoints — native markdown encyclopedia entries and system content streams.

Endpoints:
  GET /problems/{slug}     Retrieve full markdown contents and architecture metrics for an entity
"""

from fastapi import APIRouter, Path, HTTPException, status, BackgroundTasks
from typing import Annotated

from app.core.dependencies import ProblemServiceDep, AnalyticsServiceDep, SettingsDep
from app.core.logging import get_logger
from app.schemas.problems import ProblemDetailResponse

router = APIRouter(prefix="/problems", tags=["Content Engine"])
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# GET /problems/{slug}
# ---------------------------------------------------------------------------

@router.get(
    "/{slug}",
    response_model=ProblemDetailResponse,
    summary="Retrieve native-markdown document asset",
    description="Fetches raw un-rendered markdown content, computational complexity matrices, and technology tags for front-end parsing.",
)
async def get_problem(
    slug: Annotated[str, Path(min_length=2, max_length=100, regex="^[a-z0-9-]+$", description="Unique kebab-case URL identifier")],
    background_tasks: BackgroundTasks,
    problem_svc: ProblemServiceDep = None,
    analytics_svc: AnalyticsServiceDep = None,
    settings: SettingsDep = None,
) -> ProblemDetailResponse:
    logger.info("problems.request", slug=slug)

    problem = await problem_svc.fetch_by_slug(slug=slug)
    
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"The architecture engineering entity with slug designation '{slug}' is absent from this platform."
        )

    if settings.ANALYTICS_ENABLED and analytics_svc:
        background_tasks.add_task(
            analytics_svc.track_concept_view,
            problem_id=problem.id,
            slug=slug
        )

    logger.info("problems.response", slug=slug, item_id=problem.id)
    return problem