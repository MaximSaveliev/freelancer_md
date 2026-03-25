import logging

from fastapi import APIRouter, HTTPException, Query

from database import get_supabase
from models.schemas import ReviewCreateRequest, ReviewResponse

router = APIRouter(tags=["Reviews"])
logger = logging.getLogger(__name__)


def _update_profile_rating(db, target_id: str) -> None:
    rows = db.table("reviews").select("score").eq("target_id", target_id).execute().data
    count = len(rows)
    if count == 0:
        return
    avg = round(sum(r["score"] for r in rows) / count, 2)
    db.table("profiles").update({"rating": avg, "review_count": count}).eq("user_id", target_id).execute()


@router.get("/reviews/{user_id}", response_model=list[ReviewResponse])
async def list_user_reviews(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    db = get_supabase()
    rows = (
        db.table("reviews")
        .select("*")
        .eq("target_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .offset(offset)
        .execute()
        .data
    )
    return rows


@router.post("/projects/{project_id}/reviews", response_model=ReviewResponse, status_code=201)
async def create_review(project_id: str, body: ReviewCreateRequest):
    db = get_supabase()
    existing = (
        db.table("reviews")
        .select("id")
        .eq("project_id", project_id)
        .eq("author_id", body.author_id)
        .limit(1)
        .execute()
        .data
    )
    if existing:
        raise HTTPException(status_code=409, detail="You already reviewed this project")
    payload = {"project_id": project_id, **body.model_dump()}
    row = db.table("reviews").insert(payload).execute().data
    review = row[0]
    _update_profile_rating(db, body.target_id)
    return review


@router.get("/projects/{project_id}/reviews", response_model=list[ReviewResponse])
async def list_project_reviews(project_id: str):
    db = get_supabase()
    rows = (
        db.table("reviews")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .execute()
        .data
    )
    return rows
