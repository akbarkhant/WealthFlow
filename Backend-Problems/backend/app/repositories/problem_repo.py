"""
repositories/problem_repo.py

Data Access Object (DAO) for managing encyclopedia content structures and FTS5 search index lookups.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models.problem import Problem  # Assuming standard declarative ORM model
from app.core.logging import get_logger

logger = get_logger(__name__)

class ProblemRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, problem_id: int) -> Optional[Problem]:
        """Fetches a single problem document by its auto-incrementing ID."""
        logger.debug("repo.problem.get_by_id", problem_id=problem_id)
        result = await self.session.execute(select(Problem).where(Problem.id == problem_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Problem]:
        """Fetches a single problem document by its unique kebab-case slug identifier."""
        logger.debug("repo.problem.get_by_slug", slug=slug)
        result = await self.session.execute(select(Problem).where(Problem.slug == slug))
        return result.scalar_one_or_none()

    async def search_fts(
        self, 
        query: str, 
        category: Optional[str] = None, 
        difficulty: Optional[str] = None, 
        limit: int = 10
    ) -> List[Problem]:
        """
        Executes low-level full-text indexing against the SQLite FTS5 table.
        Leverages custom BM25 field weights (Title: 10, Algorithm: 8, Tags: 7) using raw SQL blocks.
        """
        logger.info("repo.problem.search_fts", query=query, category=category, difficulty=difficulty)
        
        # SQLite FTS5 optimized bm25 custom text ranking query
        # Weights matrix matching specification: title=10, algorithm=8, category=5, explanation=3
        base_query = """
            SELECT p.* FROM problems p
            JOIN problems_fts f ON p.id = f.rowid
            WHERE problems_fts MATCH :search_query
        """
        params = {"search_query": query, "limit": limit}
        
        if category:
            base_query += " AND p.category = :category"
            params["category"] = category
        if difficulty:
            base_query += " AND p.difficulty = :difficulty"
            params["difficulty"] = difficulty
            
        base_query += " ORDER BY bm25(problems_fts, 10.0, 8.0, 5.0, 3.0, 1.0, 7.0) LIMIT :limit"
        
        result = await self.session.execute(text(base_query), params)
        # Map raw result rows back into declarative ORM object sequences
        return [Problem(**row._asdict()) for row in result.all()]