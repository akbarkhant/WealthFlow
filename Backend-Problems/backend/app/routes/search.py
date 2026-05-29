"""
routes/search.py

Search API endpoints — full-text matching, fuzzy filtering, and real-time typeahead suggestions.

Endpoints:
  GET /search              Execute complex queries against the FTS5 knowledge index
  GET /search/suggestions  Fast typeahead suggestions for command palette views
"""

from fastapi import APIRouter, Query, HTTPException, BackgroundTasks, status
from typing import Annotated, List

from app.core.dependencies import (
    SearchServiceDep,
    AnalyticsServiceDep,
    SettingsDep,
)
from app.core.logging import get_logger
from app.schemas.search import (
    SearchResponse,
    SuggestionResponse,
)

router = APIRouter(prefix="/search", tags=["Search"])
logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# GET /search
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=List[SearchResponse],
    summary="Full-text and metadata knowledge base search",
    description=(
        "Queries the SQLite FTS5 search index with fuzzy matching, rank weighting, "
        "and domain specific filtering. Powers the core command-palette interface."
    ),
)
async def search_knowledge_base(
    q: Annotated[str, Query(min_length=1, max_length=128, description="Search query terms")],
    background_tasks: BackgroundTasks,
    category: Annotated[str | None, Query(description="Filter by architectural domain category")] = None,
    difficulty: Annotated[str | None, Query(description="Filter by technical difficulty level")] = None,
    tags: Annotated[List[str] | None, Query(description="Filter by accurate subject matter tags")] = None,
    search_svc: SearchServiceDep = None,
    analytics_svc: AnalyticsServiceDep = None,
    settings: SettingsDep = None,
) -> List[SearchResponse]:
    logger.info("search.request", query=q, category=category, tags=tags)

    results = await search_svc.execute_search(
        query=q,
        category=category,
        difficulty=difficulty,
        tags=tags,
        max_results=settings.SEARCH_MAX_RESULTS,
    )

    if settings.ANALYTICS_ENABLED and analytics_svc:
        background_tasks.add_task(
            analytics_svc.track_search_query,
            query=q,
            filters={"category": category, "difficulty": difficulty, "tags": tags},
            result_count=len(results),
        )

    logger.info("search.response", query=q, results_returned=len(results))
    return results


# ---------------------------------------------------------------------------
# GET /search/suggestions
# ---------------------------------------------------------------------------

@router.get(
    "/suggestions",
    response_model=List[SuggestionResponse],
    summary="Instant typeahead suggestions for command palette",
    description="Provides sub-10ms query autocomplete suggestions matching title, technology, and tag prefixes.",
)
async def get_search_suggestions(
    q: Annotated[str, Query(min_length=1, max_length=64, description="Partial phrase prefix")],
    search_svc: SearchServiceDep = None,
) -> List[SuggestionResponse]:
    logger.debug("search.suggestions.request", prefix=q)
    
    suggestions = await search_svc.get_instant_suggestions(prefix=q)
    return suggestions