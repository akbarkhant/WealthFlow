"""
routes/graph.py

Graph API endpoints — relationship traversal and knowledge graph exploration.

Endpoints:
  GET /graph/{problem_id}           Full graph (nodes + edges) for a problem
  GET /graph/{problem_id}/neighbors Direct neighbors only (1-hop)
  GET /graph/{problem_id}/path      Shortest relationship path between two nodes
  GET /graph/cluster/{category}     Cluster graph for an entire category
"""

from fastapi import APIRouter, Path, Query
from typing import Annotated

from app.core.constants import GRAPH_DEFAULT_DEPTH, RelationshipType
from app.core.dependencies import (
    AnalyticsServiceDep,
    DbSession,
    GraphServiceDep,
    SettingsDep,
)
from app.core.logging import get_logger
from app.schemas.graph import (
    GraphResponse,
    NeighborResponse,
    PathResponse,
    ClusterResponse,
)

router = APIRouter(prefix="/graph", tags=["Graph"])
logger = get_logger(__name__)

# Reusable path parameter annotation
ProblemId = Annotated[int, Path(ge=1, description="Problem / node ID")]


# ---------------------------------------------------------------------------
# GET /graph/{problem_id}
# ---------------------------------------------------------------------------

@router.get(
    "/{problem_id}",
    response_model=GraphResponse,
    summary="Full relationship graph for a knowledge node",
    description=(
        "Returns nodes and weighted edges for the given problem up to `depth` hops. "
        "Used to power the graph explorer UI."
    ),
)
async def get_graph(
    problem_id: ProblemId,
    depth: Annotated[int, Query(ge=1, le=5, description="Traversal depth")] = GRAPH_DEFAULT_DEPTH,
    relationship_type: Annotated[
        RelationshipType | None, Query(alias="type", description="Filter edges by relationship type")
    ] = None,
    min_strength: Annotated[
        float, Query(ge=0.0, le=1.0, alias="minStrength", description="Minimum edge strength")
    ] = 0.3,
    graph_svc: GraphServiceDep = None,
    analytics_svc: AnalyticsServiceDep = None,
    settings: SettingsDep = None,
) -> GraphResponse:
    logger.info("graph.request", problem_id=problem_id, depth=depth)

    graph = await graph_svc.build_graph(
        problem_id=problem_id,
        depth=depth,
        relationship_type=relationship_type,
        min_strength=min_strength,
        max_nodes=settings.GRAPH_MAX_NODES,
    )

    if settings.ANALYTICS_ENABLED:
        await analytics_svc.track_graph_traversal(
            problem_id=problem_id,
            depth=depth,
            node_count=len(graph.nodes),
        )

    logger.info(
        "graph.response",
        problem_id=problem_id,
        nodes=len(graph.nodes),
        edges=len(graph.edges),
    )
    return graph


# ---------------------------------------------------------------------------
# GET /graph/{problem_id}/neighbors
# ---------------------------------------------------------------------------

@router.get(
    "/{problem_id}/neighbors",
    response_model=NeighborResponse,
    summary="Direct neighbors of a knowledge node (1-hop)",
    description="Lightweight endpoint for sidebar relationship panels — returns only immediate connections.",
)
async def get_neighbors(
    problem_id: ProblemId,
    relationship_type: Annotated[
        RelationshipType | None, Query(alias="type")
    ] = None,
    graph_svc: GraphServiceDep = None,
) -> NeighborResponse:
    logger.debug("graph.neighbors.request", problem_id=problem_id)

    neighbors = await graph_svc.get_neighbors(
        problem_id=problem_id,
        relationship_type=relationship_type,
    )

    return NeighborResponse(problem_id=problem_id, neighbors=neighbors)


# ---------------------------------------------------------------------------
# GET /graph/{problem_id}/path
# ---------------------------------------------------------------------------

@router.get(
    "/{problem_id}/path",
    response_model=PathResponse,
    summary="Shortest relationship path between two knowledge nodes",
    description=(
        "Finds the shortest weighted path between `problem_id` and `target_id`. "
        "Useful for visualising concept dependency chains."
    ),
)
async def get_path(
    problem_id: ProblemId,
    target_id: Annotated[int, Query(ge=1, alias="targetId", description="Destination node ID")],
    graph_svc: GraphServiceDep = None,
) -> PathResponse:
    logger.debug("graph.path.request", source=problem_id, target=target_id)

    path = await graph_svc.shortest_path(
        source_id=problem_id,
        target_id=target_id,
    )

    return PathResponse(source_id=problem_id, target_id=target_id, path=path)


# ---------------------------------------------------------------------------
# GET /graph/cluster/{category}
# ---------------------------------------------------------------------------

@router.get(
    "/cluster/{category}",
    response_model=ClusterResponse,
    summary="Graph cluster for an entire knowledge category",
    description="Returns the full intra-category relationship graph — used for cluster visualisation views.",
)
async def get_cluster(
    category: Annotated[str, Path(description="Category slug e.g. distributed-systems")],
    min_strength: Annotated[float, Query(ge=0.0, le=1.0, alias="minStrength")] = 0.3,
    graph_svc: GraphServiceDep = None,
    settings: SettingsDep = None,
) -> ClusterResponse:
    logger.info("graph.cluster.request", category=category)

    cluster = await graph_svc.build_cluster(
        category=category,
        min_strength=min_strength,
        max_nodes=settings.GRAPH_MAX_NODES,
    )

    return ClusterResponse(category=category, nodes=cluster.nodes, edges=cluster.edges)