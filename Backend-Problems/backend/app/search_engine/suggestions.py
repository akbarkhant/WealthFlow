"""
backend/app/search_engine/suggestions.py

Provides production-grade, fast auto-complete and search suggestion mechanics
for the command palette interface. Utilizes SQLite FTS5 prefix tokens coupled 
with ranking matrices (weights + analytics popularity) to yield instant responses.
"""

import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select

# Setup structured logger for latency tracking
logger = logging.getLogger("app.search_engine.suggestions")


class SuggestionItem(BaseModel):
    """Pydantic schema representing a highly structured autocomplete suggestion."""
    id: int
    slug: str
    title: str
    category: str
    score: float
    matched_prefix: str
    type: str = "concept"  # Unified type for command palette handling


class SuggestionEngine:
    """
    High-performance engine designed to power the global Command Palette.
    Handles prefix normalization, FTS5 virtual table querying, and rank blending.
    """

    def __init__(self, title_weight: float = 10.0, category_weight: float = 5.0):
        self.title_weight = title_weight
        self.category_weight = category_weight

    def _sanitize_prefix(self, raw_query: str) -> str:
        """
        Cleans and sanitizes the input string to prevent SQL injection or FTS syntax breaking,
        while preparing it for trailing wildcard prefix matching.
        """
        if not raw_query:
            return ""
        
        # Remove characters that break FTS5 tokenizers but keep basic alphas/hyphens
        sanitized = "".join(c for c in raw_query if c.isalnum() or c.isspace() or c in "-_")
        tokens = sanitized.strip().split()
        
        if not tokens:
            return ""
            
        # Append '*' to the last token for real-time progressive typing matches
        # Example: "cir bre" -> "cir bre*"
        if len(tokens) > 1:
            return f"{' '.join(tokens[:-1])} {tokens[-1]}*"
        return f"{tokens[0]}*"

    async def get_instant_suggestions(
        self, 
        db: AsyncSession, 
        query: str, 
        limit: int = 8
    ) -> List[SuggestionItem]:
        """
        Executes a lightning-fast asynchronous prefix search against the FTS5 virtual table,
        cross-referencing analytics vectors to rank trending data highest.
        
        Args:
            db: The active SQLAlchemy AsyncSession.
            query: The raw partial query string typed by the user (e.g., "circ").
            limit: Maximum suggestions to return for optimal command palette UX.
        """
        fts_query = self._sanitize_prefix(query)
        if not fts_query:
            return []

        # Raw highly-optimized SQL query leveraging FTS5 BM25 + Analytics Hit adjustments
        # This blends structural match weights with historical click/search trends.
        raw_sql = text("""
            SELECT 
                p.id,
                p.slug,
                p.title,
                p.category,
                (
                    (bm25(problems_fts, :title_w, 0.0, 0.0, 0.0, :cat_w, 0.0) * -1.0) +
                    (COALESCE(analytics_agg.hit_count, 0) * 0.1)
                ) as composite_score
            FROM problems_fts f
            JOIN problems p ON p.id = f.rowid
            LEFT JOIN (
                -- Subquery window to fetch aggregated discovery clicks
                SELECT 
                    slug, 
                    COUNT(*) as hit_count 
                FROM analytics 
                WHERE action_type IN ('search', 'recommendation_click', 'graph_traverse')
                GROUP BY slug
            ) analytics_agg ON p.slug = analytics_agg.slug
            WHERE problems_fts MATCH :fts_expression
            ORDER BY composite_score DESC
            LIMIT :max_results;
        """)

        try:
            result = await db.execute(
                raw_sql,
                {
                    "fts_expression": fts_query,
                    "title_w": self.title_weight,
                    "cat_w": self.category_weight,
                    "max_results": limit
                }
            )
            
            suggestions = []
            for row in result.fetchall():
                suggestions.append(
                    SuggestionItem(
                        id=row.id,
                        slug=row.slug,
                        title=row.title,
                        category=row.category,
                        score=round(row.composite_score, 4),
                        matched_prefix=query.strip()
                    )
                )
            return suggestions

        except Exception as e:
            logger.error(f"FTS5 Suggestion execution failure on query '{query}': {str(e)}", exc_info=True)
            # Safe degradation pattern: Fallback to basic ILIKE substring indexing if FTS5 fails or is locked
            return await self._fallback_substring_suggestions(db, query, limit)

    async def _fallback_substring_suggestions(
        self, 
        db: AsyncSession, 
        query: str, 
        limit: int
    ) -> List[SuggestionItem]:
        """
        Fail-safe query path using standard lowercase sub-string matching.
        Ensures the UI doesn't freeze or drop if the virtual index encounters a transient issue.
        """
        logger.warning(f"Executing degraded fallback suggestion path for: '{query}'")
        clean_query = query.strip().lower()
        if not clean_query:
            return []

        # Standard relational query against base metadata table
        fallback_sql = text("""
            SELECT id, slug, title, category 
            FROM problems 
            WHERE LOWER(title) LIKE :pattern OR LOWER(category) LIKE :pattern
            LIMIT :max_results;
        """)
        
        try:
            res = await db.execute(fallback_sql, {"pattern": f"%{clean_query}%", "max_results": limit})
            return [
                SuggestionItem(
                    id=row.id,
                    slug=row.slug,
                    title=row.title,
                    category=row.category,
                    score=1.0,  # Flat fallback score attribution
                    matched_prefix=query
                )
                for row in res.fetchall()
            ]
        except Exception as dynamic_err:
            logger.critical(f"Total systemic failure on suggestion engine: {str(dynamic_err)}")
            return []


# Component Singleton Instance ready for Router Injection Dependency Injection
suggestion_engine = SuggestionEngine()