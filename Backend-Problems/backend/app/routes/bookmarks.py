"""
routes/bookmarks.py

Bookmark & Personalization API endpoints — user saved profiles, history, and spaces.

Endpoints:
  GET    /bookmarks              List all personal architectural saved nodes
  POST   /bookmarks              Add an encyclopedia target to user bookmarks
  DELETE /bookmarks/{problem_id} Remove an encyclopedia target from user bookmarks
"""

from fastapi import APIRouter, Path, HTTPException, status, Depends
from typing import Annotated, List

from app.core.dependencies import BookmarkServiceDep
from app.core.logging import get_logger
from app.schemas.bookmarks import BookmarkResponse, BookmarkCreate

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks & Personalization"])
logger = get_logger(__name__)

# Reusable path parameter annotation
ProblemId = Annotated[int, Path(ge=1, description="Target problem/node ID to affect")]


# ---------------------------------------------------------------------------
# GET /bookmarks
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=List[BookmarkResponse],
    summary="List all personalized bookmarks",
    description="Retrieves a sorted list of all system design items saved by the operator.",
)
async def list_bookmarks(bookmark_svc: BookmarkServiceDep = None) -> List[BookmarkResponse]:
    logger.debug("bookmarks.list.request")
    return await bookmark_svc.get_all_bookmarks()


# ---------------------------------------------------------------------------
# POST /bookmarks
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=BookmarkResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Bookmark a knowledge base entity",
    description="Saves a reference link to a problem or strategy in the personalization layout.",
)
async def create_bookmark(
    payload: BookmarkCreate,
    bookmark_svc: BookmarkServiceDep = None,
) -> BookmarkResponse:
    logger.info("bookmarks.create.request", problem_id=payload.problem_id)
    
    bookmark = await bookmark_svc.add_bookmark(payload)
    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot bookmark target entity {payload.problem_id}. Check existence integrity."
        )
    return bookmark


# ---------------------------------------------------------------------------
# DELETE /bookmarks/{problem_id}
# ---------------------------------------------------------------------------

@router.delete(
    "/{problem_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a bookmarked entity",
    description="Asynchronously purges a saved entry link from the personalization records.",
)
async def remove_bookmark(
    problem_id: ProblemId,
    bookmark_svc: BookmarkServiceDep = None,
):
    logger.info("bookmarks.delete.request", problem_id=problem_id)
    
    success = await bookmark_svc.delete_bookmark(problem_id=problem_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active bookmark mapping for entity ID {problem_id} could not be resolved."
        )
    return None