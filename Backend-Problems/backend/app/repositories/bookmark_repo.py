"""
repositories/bookmark_repo.py

Data Access Object tracking personalized collections, bookmarks, and user learning workspaces.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from app.models.bookmark import Bookmark
from app.core.logging import get_logger

logger = get_logger(__name__)

class BookmarkRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> List[Bookmark]:
        """Pulls comprehensive user tracking layout configurations for standard synchronization."""
        stmt = select(Bookmark).order_by(Bookmark.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_problem(self, problem_id: int) -> Optional[Bookmark]:
        """Validates if an active entry linkage map currently links an item into personalization layouts."""
        stmt = select(Bookmark).where(Bookmark.problem_id == problem_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def add(self, problem_id: int) -> Bookmark:
        """Injects a reference link to a problem or architecture strategy into personal workspaces."""
        logger.info("repo.bookmark.add", problem_id=problem_id)
        new_bookmark = Bookmark(problem_id=problem_id)
        self.session.add(new_bookmark)
        await self.session.flush()  # Extract auto-generated database metrics without committing premature transactional boundaries
        return new_bookmark

    async def remove(self, problem_id: int) -> bool:
        """Asynchronously purges saved entry reference logs from user personalization parameters."""
        logger.info("repo.bookmark.remove", problem_id=problem_id)
        stmt = delete(Bookmark).where(Bookmark.problem_id == problem_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0