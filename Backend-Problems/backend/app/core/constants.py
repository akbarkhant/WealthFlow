"""
core/constants.py

All platform-wide constants, enumerations, and magic values.
Import from here; never scatter string literals across the codebase.
"""

from enum import Enum


# ===========================================================================
# Relationship types  (mirrors the graph relationship model in the spec)
# ===========================================================================

class RelationshipType(str, Enum):
    DEPENDS_ON   = "depends_on"
    RELATED_TO   = "related_to"
    ALTERNATIVE  = "alternative_to"
    IMPROVES     = "improves"
    SCALES_WITH  = "scales_with"
    SOLVES       = "solves"
    PREVENTS     = "prevents"
    EXTENDS      = "extends"
    IMPLEMENTS   = "implements"
    OPTIMIZES    = "optimizes"


# ===========================================================================
# Content difficulty levels
# ===========================================================================

class Difficulty(str, Enum):
    BEGINNER     = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED     = "advanced"
    EXPERT       = "expert"


# ===========================================================================
# Problem / knowledge categories
# ===========================================================================

class Category(str, Enum):
    DISTRIBUTED_SYSTEMS  = "distributed-systems"
    DATABASES            = "databases"
    CACHING              = "caching"
    MESSAGING            = "messaging"
    NETWORKING           = "networking"
    ALGORITHMS           = "algorithms"
    DATA_STRUCTURES      = "data-structures"
    DESIGN_PATTERNS      = "design-patterns"
    SYSTEM_DESIGN        = "system-design"
    OBSERVABILITY        = "observability"
    SECURITY             = "security"
    PERFORMANCE          = "performance"
    CONCURRENCY          = "concurrency"
    STORAGE              = "storage"
    API_DESIGN           = "api-design"


# ===========================================================================
# Analytics event types
# ===========================================================================

class AnalyticsEvent(str, Enum):
    SEARCH              = "search"
    SUGGESTION_CLICK    = "suggestion_click"
    GRAPH_TRAVERSAL     = "graph_traversal"
    RECOMMENDATION_CLICK = "recommendation_click"
    BOOKMARK_ADD        = "bookmark_add"
    BOOKMARK_REMOVE     = "bookmark_remove"
    PROBLEM_VIEW        = "problem_view"
    COMMAND_PALETTE_OPEN = "command_palette_open"


# ===========================================================================
# Cache key prefixes  (used by cache layer to namespace Redis keys)
# ===========================================================================

class CachePrefix(str, Enum):
    SEARCH          = "search:"
    SUGGESTIONS     = "suggestions:"
    GRAPH           = "graph:"
    RECOMMENDATIONS = "recommendations:"
    TRENDING        = "trending:"
    PROBLEM         = "problem:"
    TAGS            = "tags:"


# ===========================================================================
# FTS5 virtual table and column names
# ===========================================================================

FTS_TABLE             = "problems_fts"
FTS_COLUMNS           = ("title", "algorithm", "category", "explanation", "technologies", "tags")

# BM25 rank weight vector — order must match FTS_COLUMNS
# FTS5 bm25() takes weights in column-definition order
FTS_BM25_WEIGHTS      = "bm25(problems_fts, 10, 8, 5, 3, 2, 7)"


# ===========================================================================
# Pagination defaults
# ===========================================================================

DEFAULT_PAGE          = 1
DEFAULT_PAGE_SIZE     = 20
MAX_PAGE_SIZE         = 100


# ===========================================================================
# Graph traversal defaults
# ===========================================================================

GRAPH_DEFAULT_DEPTH   = 2
GRAPH_MIN_EDGE_WEIGHT = 0.3


# ===========================================================================
# Recommendation scoring weights  (normalised; sum need not equal 1)
# ===========================================================================

RECOMMENDATION_WEIGHT_RELATIONSHIP  = 0.40
RECOMMENDATION_WEIGHT_SHARED_TAGS   = 0.30
RECOMMENDATION_WEIGHT_SAME_DOMAIN   = 0.20
RECOMMENDATION_WEIGHT_TECH_OVERLAP  = 0.10


# ===========================================================================
# HTTP response messages
# ===========================================================================

MSG_NOT_FOUND           = "Resource not found."
MSG_INTERNAL_ERROR      = "An unexpected error occurred. Please try again later."
MSG_RATE_LIMITED        = "Too many requests. Please slow down."
MSG_SEARCH_EMPTY_QUERY  = "Search query cannot be empty."
MSG_INVALID_PAGE        = "Page number must be a positive integer."


# ===========================================================================
# Header names used by middleware
# ===========================================================================

HEADER_REQUEST_ID    = "X-Request-ID"
HEADER_PROCESS_TIME  = "X-Process-Time"
HEADER_API_VERSION   = "X-API-Version"