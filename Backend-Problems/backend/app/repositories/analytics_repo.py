"""
repositories/analytics_repo.py

Data Access Object tracking exploration paths, interaction velocities, and telemetry event streams.
"""

from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.models.analytics import AnalyticsLog
from app.core.logging import get_logger

logger = get_logger(__name__)

class AnalyticsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save_log(self, event_type: str, details: Dict[str, Any]) -> None:
        """Appends transactional interaction metrics straight down to database engine logs."""
        logger.debug("repo.analytics.save_log", event_type=event_type)
        log_entry = AnalyticsLog(
            event_type=event_type,
            details=details,
            created_at=datetime.now(timezone.utc)
        )
        self.session.add(log_entry)
        # Flush or let outer context commits aggregate block pipelines asynchronously

    async def aggregate_interaction_velocity(self, time_window_hours: int = 24, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Parses sliding system logs to score trending technical concept metrics.
        Aggregates action counts against specific target problems to form a localized trending feed.
        """
        logger.info("repo.analytics.aggregate_velocity", window_hours=time_window_hours)
        
        # Parsing JSON metrics tracking within SQLite structure natively
        stmt = """
            SELECT json_extract(details, '$.problem_id') as target_id, COUNT(*) as hit_count
            FROM analytics_logs
            WHERE created_at >= :window_threshold
              AND json_extract(details, '$.problem_id') IS NOT NULL
            GROUP BY target_id
            ORDER BY hit_count DESC
            LIMIT :limit
        """
        threshold = datetime.now(timezone.utc) - timedelta(hours=time_window_hours)
        result = await self.session.execute(text(stmt), {"window_threshold": threshold, "limit": limit})
        
        return [{"problem_id": int(row[0]), "score": row[1]} for row in result.all() if row[0] is not None]