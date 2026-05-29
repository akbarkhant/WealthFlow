"""
repositories/relationship_repo.py

Data Access Object for structural graph operations, neighbor resolution, and dependency chains.
"""

from typing import List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.relationship import Relationship
from app.core.logging import get_logger

logger = get_logger(__name__)

class RelationshipRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_node_neighbors(
        self, 
        problem_id: int, 
        relationship_type: Optional[str] = None
    ) -> List[Relationship]:
        """Fetches 1-hop direct directional connections branching out from or into a target node."""
        logger.debug("repo.relationship.get_neighbors", problem_id=problem_id, type=relationship_type)
        
        conditions = [or_(Relationship.source_id == problem_id, Relationship.target_id == problem_id)]
        if relationship_type:
            conditions.append(Relationship.relationship_type == relationship_type)
            
        stmt = select(Relationship).where(and_(*conditions))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_graph_network(self, min_strength: float = 0.3, limit: int = 500) -> List[Relationship]:
        """Retrieves bulk segments of the relational graph matrix filtered by connection threshold weights."""
        logger.info("repo.relationship.get_network", min_strength=min_strength)
        stmt = select(Relationship).where(Relationship.strength >= min_strength).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_relationships_by_category(self, category: str, min_strength: float = 0.3) -> List[Tuple[int, int, str, float]]:
        """Executes a join traversal to establish connectivity exclusively between nodes within a shared taxonomic zone."""
        logger.info("repo.relationship.get_by_category", category=category)
        
        # Raw statement optimization for quick cluster renderings
        raw_stmt = """
            SELECT r.source_id, r.target_id, r.relationship_type, r.strength 
            FROM relationships r
            JOIN problems p1 ON r.source_id = p1.id
            JOIN problems p2 ON r.target_id = p2.id
            WHERE p1.category = :category AND p2.category = :category AND r.strength >= :min_strength
        """
        result = await self.session.execute(text(raw_stmt), {"category": category, "min_strength": min_strength})
        return [(row[0], row[1], row[2], row[3]) for row in result.all()]