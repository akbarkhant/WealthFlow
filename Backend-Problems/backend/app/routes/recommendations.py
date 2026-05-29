"""
routes/recommendations.py

Recommendation API endpoints — graph-driven and contextual discovery generation.

Endpoints:
  GET /recommendations/{problem_id}   Get structural recommendation vectors for a node
"""

from fastapi import APIRouter, Path, Query, HTTPException, status
from typing import Annotated, List

from app.core.dependencies import RecommendationServiceDep, SettingsDep
from app.core.logging import get_logger
from app.schemas.problems import ProblemMinimalResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])
logger = get_logger(__name__)

# Reusable path parameter annotation
ProblemId = Annotated[int, Path(ge=1, description="Context problem/node ID")]


# ---------------------------------------------------------------------------
# GET /recommendations/{problem_id}
# ---------------------------------------------------------------------------

@router.get(
    "/{problem_id}",
    response_model=List[ProblemMinimalResponse],
    summary="Graph-driven contextual suggestions",
    description=(
        "Generates multi-factored architecture recommendations using relationship strength, "
        "shared cluster tags, and domain taxonomy instead of naive string matching."
    ),
)
async def get_recommendations(
    problem_id: ProblemId,
    limit: Annotated[int, Query(ge=1, le=20, description="Max recommendations to fetch")] = 5,
    recommendation_svc: RecommendationServiceDep = None,
    settings: SettingsDep = None,
) -> List[ProblemMinimalResponse]:
    logger.info("recommendations.request", problem_id=problem_id, limit=limit)

    recommendations = await recommendation_svc.generate_recommendations(
        problem_id=problem_id,
        limit=limit,
        min_score=settings.RECOMMENDATION_MIN_SCORE,
    )

    if recommendations is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Context node with ID {problem_id} does not exist to derive context from."
        )

    logger.info("recommendations.response", problem_id=problem_id, generated_count=len(recommendations))
    return recommendations