"""
core/events.py

FastAPI lifespan context manager.

Handles:
  - Logging initialisation
  - Database connection setup and teardown
  - FTS5 virtual table bootstrap
  - Seed data loading (development only)
  - Cache connection (Phase 2, when CACHE_ENABLED=True)
  - Graceful shutdown of all resources

Usage in main.py:
    from contextlib import asynccontextmanager
    from app.core.events import lifespan

    app = FastAPI(lifespan=lifespan, ...)
"""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.core.config import get_settings
from app.core.logging import get_logger, setup_logging

logger = get_logger(__name__)
settings = get_settings()


# ---------------------------------------------------------------------------
# Individual startup / shutdown helpers
# ---------------------------------------------------------------------------

async def _startup_logging() -> None:
    setup_logging()
    logger.info(
        "platform.startup",
        app=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        debug=settings.DEBUG,
    )


async def _startup_database() -> None:
    """Initialise SQLAlchemy async engine and run migrations / table creation."""
    from app.database.session import init_db  # imported lazily to avoid circular refs

    logger.info("database.connecting", url=settings.DATABASE_URL)
    await init_db()
    logger.info("database.ready")


async def _startup_fts() -> None:
    """Ensure FTS5 virtual tables exist and are populated."""
    from app.search_engine.fts import bootstrap_fts  # lazy import

    logger.info("fts.bootstrapping", table=settings.FTS_TABLE_NAME)
    await bootstrap_fts()
    logger.info("fts.ready")


async def _startup_seed_data() -> None:
    """Load seed data in non-production environments if the DB is empty."""
    if settings.is_production:
        return

    from app.database.seed import load_seed_data  # lazy import

    logger.info("seed.loading", source=str(settings.DATA_DIR))
    loaded = await load_seed_data()
    logger.info("seed.loaded", records=loaded)


async def _startup_cache() -> None:
    """Connect to Redis if caching is enabled (Phase 2)."""
    if not settings.CACHE_ENABLED:
        logger.debug("cache.disabled")
        return

    from app.cache.redis import init_cache  # lazy import

    logger.info("cache.connecting", url=settings.REDIS_URL)
    await init_cache()
    logger.info("cache.ready")


# ---------------------------------------------------------------------------
# Shutdown helpers
# ---------------------------------------------------------------------------

async def _shutdown_database() -> None:
    from app.database.session import close_db  # lazy import

    logger.info("database.closing")
    await close_db()
    logger.info("database.closed")


async def _shutdown_cache() -> None:
    if not settings.CACHE_ENABLED:
        return

    from app.cache.redis import close_cache  # lazy import

    logger.info("cache.closing")
    await close_cache()
    logger.info("cache.closed")


# ---------------------------------------------------------------------------
# Lifespan context manager (FastAPI ≥ 0.93)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:  # noqa: ARG001
    """
    Platform lifespan handler.

    Everything before `yield` runs on startup.
    Everything after `yield` runs on shutdown.
    """

    # ---- STARTUP ---------------------------------------------------------
    await _startup_logging()

    try:
        await _startup_database()
        await _startup_fts()
        await _startup_seed_data()
        await _startup_cache()
    except Exception as exc:
        logger.exception("platform.startup_failed", error=str(exc))
        raise

    logger.info("platform.ready", host=settings.HOST, port=settings.PORT)

    yield  # ← application runs here

    # ---- SHUTDOWN --------------------------------------------------------
    logger.info("platform.shutdown_begin")

    await _shutdown_cache()
    await _shutdown_database()

    logger.info("platform.shutdown_complete")