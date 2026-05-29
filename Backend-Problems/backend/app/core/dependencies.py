"""
core/dependencies.py

FastAPI dependency injection providers.

Centralises every shared resource the route handlers need:
  - Async DB session
  - Settings
  - Search service
  - Graph service
  - Recommendation service
  - Analytics service
  - Cache client
  - Pagination params
  - Request-scoped logger

Usage in a route:
    from app.core.dependencies import get_db, get_search_service, Pagination

    @router.get("/search")
    async def search(
        q: str,
        pagination: Pagination = Depends(get_pagination),
        db: AsyncSession = Depends(get_db),
        search_svc: SearchService = Depends(get_search_service),
    ):
        ...
"""

from typing import Annotated, AsyncIterator

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.constants import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE
from app.core.logging import get_logger

logger = get_logger(__name__)


# ===========================================================================
# Settings
# ===========================================================================

def get_app_settings() -> Settings:
    """Inject the singleton Settings object."""
    return get_settings()


SettingsDep = Annotated[Settings, Depends(get_app_settings)]


# ===========================================================================
# Database session
# ===========================================================================

async def get_db() -> AsyncIterator[AsyncSession]:
    """
    Yield a per-request async SQLAlchemy session.
    Session is committed on success and rolled back on exception.
    """
    from app.database.session import AsyncSessionLocal  # lazy to avoid circular imports

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


DbSession = Annotated[AsyncSession, Depends(get_db)]


# ===========================================================================
# Pagination
# ===========================================================================

class Pagination:
    """Reusable pagination parameters parsed from query-string."""

    def __init__(
        self,
        page: int = Query(default=DEFAULT_PAGE, ge=1, description="Page number (1-based)"),
        page_size: int = Query(
            default=DEFAULT_PAGE_SIZE,
            ge=1,
            le=MAX_PAGE_SIZE,
            alias="pageSize",
            description="Results per page",
        ),
    ) -> None:
        self.page = page
        self.page_size = page_size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


def get_pagination(
    page: int = Query(default=DEFAULT_PAGE, ge=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, alias="pageSize"),
) -> Pagination:
    p = Pagination.__new__(Pagination)
    p.page = page
    p.page_size = page_size
    return p


PaginationDep = Annotated[Pagination, Depends(get_pagination)]


# ===========================================================================
# Search service
# ===========================================================================

def get_search_service(db: DbSession) -> "SearchService":  # noqa: F821
    from app.services.search_service import SearchService  # lazy import

    return SearchService(db=db)


SearchServiceDep = Annotated["SearchService", Depends(get_search_service)]


# ===========================================================================
# Graph service
# ===========================================================================

def get_graph_service(db: DbSession) -> "GraphService":  # noqa: F821
    from app.services.graph_service import GraphService  # lazy import

    return GraphService(db=db)


GraphServiceDep = Annotated["GraphService", Depends(get_graph_service)]


# ===========================================================================
# Recommendation service
# ===========================================================================

def get_recommendation_service(db: DbSession) -> "RecommendationService":  # noqa: F821
    from app.services.recommendation_service import RecommendationService  # lazy import

    return RecommendationService(db=db)


RecommendationServiceDep = Annotated[
    "RecommendationService", Depends(get_recommendation_service)
]


# ===========================================================================
# Analytics service
# ===========================================================================

def get_analytics_service(db: DbSession) -> "AnalyticsService":  # noqa: F821
    from app.services.analytics_service import AnalyticsService  # lazy import

    return AnalyticsService(db=db)


AnalyticsServiceDep = Annotated["AnalyticsService", Depends(get_analytics_service)]


# ===========================================================================
# Cache client  (optional — only available when CACHE_ENABLED=True)
# ===========================================================================

async def get_cache() -> "CacheClient | None":  # noqa: F821
    settings = get_settings()
    if not settings.CACHE_ENABLED:
        return None

    from app.cache.redis import get_cache_client  # lazy import

    return await get_cache_client()


CacheDep = Annotated["CacheClient | None", Depends(get_cache)]


# ===========================================================================
# Request-scoped logger
# (structlog already binds request_id via middleware, this adds route name)
# ===========================================================================

def get_request_logger(settings: SettingsDep) -> "BoundLogger":  # noqa: F821
    return get_logger("api")


RequestLoggerDep = Annotated["BoundLogger", Depends(get_request_logger)]