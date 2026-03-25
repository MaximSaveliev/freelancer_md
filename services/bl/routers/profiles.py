import logging

from fastapi import APIRouter, HTTPException, Query

from database import get_supabase
from models.schemas import ProfileCreateRequest, ProfileResponse, ProfileUpdateRequest

router = APIRouter(prefix="/profiles", tags=["Profiles"])
logger = logging.getLogger(__name__)


def _get_profile(db, user_id: str) -> dict:
    rows = db.table("profiles").select("*").eq("user_id", user_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Profile not found")
    return rows[0]


@router.post("", response_model=ProfileResponse, status_code=201)
async def create_profile(body: ProfileCreateRequest):
    db = get_supabase()
    existing = db.table("profiles").select("id").eq("user_id", body.user_id).limit(1).execute().data
    if existing:
        raise HTTPException(status_code=409, detail="Profile already exists for this user")
    row = db.table("profiles").insert(body.model_dump()).execute().data
    return row[0]


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_profile(user_id: str):
    db = get_supabase()
    return _get_profile(db, user_id)


@router.patch("/{user_id}", response_model=ProfileResponse)
async def update_profile(user_id: str, body: ProfileUpdateRequest, requester_id: str = Query(...)):
    db = get_supabase()
    profile = _get_profile(db, user_id)
    if profile["user_id"] != requester_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        return profile
    db.table("profiles").update(updates).eq("user_id", user_id).execute()
    return _get_profile(db, user_id)
