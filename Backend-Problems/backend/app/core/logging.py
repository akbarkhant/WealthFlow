"""
core/logging.py

Structured logging for the Backend Engineering Knowledge Platform.

- Development  → human-readable coloured output via structlog
- Production   → JSON lines (machine-parseable, ELK / Loki ready)

Usage:
    from app.core.logging import get_logger

    logger = get_logger(__name__)
    logger.info("search.executed", query="raft", results=12, latency_ms=4.2)
"""

import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, WrappedLogger

from app.core.config import get_settings


# ---------------------------------------------------------------------------
# Custom processors
# ---------------------------------------------------------------------------

def _add_app_context(
    logger: WrappedLogger,   # noqa: ARG001
    method_name: str,        # noqa: ARG001
    event_dict: EventDict,
) -> EventDict:
    """Inject static platform metadata into every log record."""
    settings = get_settings()
    event_dict.setdefault("app", settings.APP_NAME)
    event_dict.setdefault("version", settings.APP_VERSION)
    event_dict.setdefault("env", settings.ENVIRONMENT)
    return event_dict


def _drop_colour_message_key(
    logger: WrappedLogger,   # noqa: ARG001
    method_name: str,        # noqa: ARG001
    event_dict: EventDict,
) -> EventDict:
    """
    structlog adds a `_record` key when stdlib integration is active.
    Drop internal keys that clutter JSON output.
    """
    event_dict.pop("_record", None)
    event_dict.pop("_from_structlog", None)
    return event_dict


# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

def setup_logging() -> None:
    """
    Call once at application startup (inside the lifespan event).
    Idempotent — safe to call multiple times.
    """
    settings = get_settings()
    log_level = getattr(logging, settings.LOG_LEVEL, logging.INFO)

    # Shared processors applied to every log record regardless of format
    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
        _add_app_context,
        _drop_colour_message_key,
    ]

    if settings.LOG_FORMAT == "json":
        # ----------------------------------------------------------------
        # Production: structured JSON lines
        # ----------------------------------------------------------------
        renderer = structlog.processors.JSONRenderer()
    else:
        # ----------------------------------------------------------------
        # Development: coloured, human-readable console output
        # ----------------------------------------------------------------
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )

    # Wire up stdlib root logger so third-party libs (SQLAlchemy, uvicorn, etc.)
    # also flow through structlog
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(log_level)

    # Optional file handler
    if settings.LOG_FILE:
        file_handler = logging.FileHandler(settings.LOG_FILE, encoding="utf-8")
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

    # Silence noisy third-party loggers in production
    if settings.is_production:
        for noisy in ("uvicorn.access", "sqlalchemy.engine", "aiosqlite"):
            logging.getLogger(noisy).setLevel(logging.WARNING)


# ---------------------------------------------------------------------------
# Public factory
# ---------------------------------------------------------------------------

def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """
    Return a bound structlog logger.

    Example
    -------
    logger = get_logger(__name__)
    logger.info("graph.traversal", node_id=17, depth=2, edge_count=5)
    """
    return structlog.get_logger(name)


# ---------------------------------------------------------------------------
# Request-scoped context helpers  (used by logging middleware)
# ---------------------------------------------------------------------------

def bind_request_context(**kwargs: Any) -> None:
    """Bind key/value pairs to the current async context (per-request)."""
    structlog.contextvars.bind_contextvars(**kwargs)


def clear_request_context() -> None:
    """Clear all context vars at the end of a request."""
    structlog.contextvars.clear_contextvars()