"""
repositories/tag_repo.py

Data Access Object for managing technical classifications, keywords, and many-to-many junction indices.
"""

from typing import List, Set
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models.tag import Tag
from app.core.logging import get_logger

logger = get_logger(__name__)

class TagRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_tags(self) -> List[Tag]:
        """Lists out all existing subject matter classification names across the database system."""
        result = await self.session.execute(select(Tag).order_by(Tag.name))
        return list(result.scalars().all())

    async def get_tags_by_problem(self, problem_id: int) -> List[Tag]:
        """Resolves the many-to-many intersection to pull active tags bound to a specific knowledge node."""
        logger.debug("repo.tag.get_by_problem", problem_id=problem_id)
        stmt = """
            SELECT t.* FROM tags t
            JOIN problem_tags pt ON t.id = pt.tag_id
            WHERE pt.problem_id = :problem_id
        """
        result = await self.session.execute(text(stmt), {"problem_id": problem_id})
        return [Tag(**row._asdict()) for row in result.all()]

    async def find_shared_tag_node_ids(self, problem_id: int, limit: int = 10) -> List[int]:
        """
        Locates alternative structural nodes sharing high-density matching tag intersections.
        Used to feed similarity engines within the Recommendation System.
        """
        stmt = """
            SELECT target.problem_id 
            FROM problem_tags target
            JOIN problem_tags source ON target.tag_id = source.tag_id
            WHERE source.problem_id = :problem_id AND target.problem_id != :problem_id
            GROUP BY target.problem_id
            ORDER BY COUNT(target.tag_id) DESC
            LIMIT :limit
        """
        result = await self.session.execute(text(stmt), {"problem_id": problem_id, "limit": limit})
        return [row[0] for row in result.all()]