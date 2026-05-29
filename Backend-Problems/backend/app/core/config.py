"""
core/config.py

Central configuration for the Backend Engineering Knowledge Platform.
All settings are environment-driven via Pydantic BaseSettings.
Override any value with a matching environment variable or a .env file.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Platform-wide settings.

    Priority order (highest → lowest):
      1. Environment variables
      2. .env file at project root
      3. Defaults defined here
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Application identity
    # ------------------------------------------------------------------
    APP_NAME: str = "Backend Engineering Knowledge Platform"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = (
        "A search-first, graph-driven developer knowledge and exploration engine."
    )
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True

    # ------------------------------------------------------------------
    # API / server
    # ------------------------------------------------------------------
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    # SQLite path (MVP). Switch to postgresql+asyncpg://... for Phase 2.
    DATABASE_URL: str = "sqlite+aiosqlite:///./knowledge_platform.db"
    DATABASE_ECHO: bool = False          # set True to log all SQL statements
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10

    # ------------------------------------------------------------------
    # SQLite FTS5 search
    # ------------------------------------------------------------------
    FTS_TABLE_NAME: str = "problems_fts"
    SEARCH_RESULT_LIMIT: int = 20
    SUGGESTION_LIMIT: int = 8

    # ------------------------------------------------------------------
    # Search ranking weights  (title has highest signal)
    # ------------------------------------------------------------------
    RANK_WEIGHT_TITLE: int = 10
    RANK_WEIGHT_ALGORITHM: int = 8
    RANK_WEIGHT_TAGS: int = 7
    RANK_WEIGHT_CATEGORY: int = 5
    RANK_WEIGHT_EXPLANATION: int = 3

    # ------------------------------------------------------------------
    # Graph engine
    # ------------------------------------------------------------------
    GRAPH_MAX_DEPTH: int = 3             # max relationship traversal depth
    GRAPH_MIN_STRENGTH: float = 0.3      # edges weaker than this are pruned
    GRAPH_MAX_NODES: int = 50            # cap for single graph response

    # ------------------------------------------------------------------
    # Recommendation engine
    # ------------------------------------------------------------------
    RECOMMENDATION_LIMIT: int = 6
    RECOMMENDATION_MIN_SCORE: float = 0.2

    # ------------------------------------------------------------------
    # Cache (Redis — Phase 2, optional in MVP)
    # ------------------------------------------------------------------
    CACHE_ENABLED: bool = False
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SEARCH: int = 60           # seconds
    CACHE_TTL_GRAPH: int = 300
    CACHE_TTL_RECOMMENDATIONS: int = 300
    CACHE_TTL_TRENDING: int = 600

    # ------------------------------------------------------------------
    # Rate limiting
    # ------------------------------------------------------------------
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_SEARCH: str = "60/minute"
    RATE_LIMIT_ANALYTICS: str = "120/minute"
    RATE_LIMIT_RECOMMENDATIONS: str = "60/minute"

    # ------------------------------------------------------------------
    # Analytics
    # ------------------------------------------------------------------
    ANALYTICS_ENABLED: bool = True
    TRENDING_WINDOW_HOURS: int = 24
    TRENDING_LIMIT: int = 10

    # ------------------------------------------------------------------
    # Logging
    # ------------------------------------------------------------------
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: Literal["json", "pretty"] = "pretty"
    LOG_FILE: str | None = None          # None → stdout only

    # ------------------------------------------------------------------
    # Paths
    # ------------------------------------------------------------------
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    SEED_PROBLEMS_FILE: Path = DATA_DIR / "problems.json"
    SEED_RELATIONSHIPS_FILE: Path = DATA_DIR / "relationships.json"
    SEED_TECHNOLOGIES_FILE: Path = DATA_DIR / "technologies.json"

    # ------------------------------------------------------------------
    # Future: AI / LLM context engine
    # ------------------------------------------------------------------
    AI_ENABLED: bool = False
    AI_MODEL: str = "gpt-4o"
    AI_MAX_CONTEXT_TOKENS: int = 8000
    AI_RETRIEVAL_LIMIT: int = 5          # top-N chunks fed to LLM

    # ------------------------------------------------------------------
    # Validators
    # ------------------------------------------------------------------
    @field_validator("LOG_LEVEL")
    @classmethod
    def normalise_log_level(cls, v: str) -> str:
        return v.upper()

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def openapi_url(self) -> str | None:
        """Disable OpenAPI docs in production."""
        return None if self.is_production else "/openapi.json"

    @property
    def docs_url(self) -> str | None:
        return None if self.is_production else "/docs"

    @property
    def redoc_url(self) -> str | None:
        return None if self.is_production else "/redoc"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return the singleton Settings instance.

    Usage anywhere in the app:
        from app.core.config import get_settings
        settings = get_settings()
    """
    return Settings()


# Module-level alias for convenience
settings: Settings = get_settings()