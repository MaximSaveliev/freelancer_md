import asyncio
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_supabase
from models.schemas import ProfileCreateRequest, ProfileResponse, ProfileUpdateRequest
from publisher import publish_event

router = APIRouter(prefix="/profiles", tags=["Profiles"])
logger = logging.getLogger(__name__)


def _get_profile(db, user_id: str) -> dict:
    rows = db.table("profiles").select("*").eq("user_id", user_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Profile not found")
    return rows[0]


def _get_user(db, user_id: str) -> dict:
    rows = db.table("users").select("email,role,phone,is_verified").eq("id", user_id).limit(1).execute().data
    return rows[0] if rows else {}


def _publish_user_event(queue: str, profile: dict, user: dict) -> None:
    payload = {
        "user_id": profile.get("user_id"),
        "email": user.get("email"),
        "role": user.get("role"),
        "phone": user.get("phone"),
        "is_verified": user.get("is_verified"),
        "first_name": profile.get("first_name"),
        "last_name": profile.get("last_name"),
        "avatar_url": profile.get("avatar_url"),
        "bio": profile.get("bio"),
        "location": profile.get("location"),
        "grade": profile.get("grade"),
        "hourly_rate": profile.get("hourly_rate"),
        "created_at": str(profile.get("created_at", "")),
    }
    asyncio.create_task(publish_event(queue, payload))


@router.get("", response_model=list[ProfileResponse])
async def list_profiles(
    role: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    db = get_supabase()
    if role:
        user_rows = db.table("users").select("id").eq("role", role.upper()).execute().data
        if not user_rows:
            return []
        user_ids = [r["id"] for r in user_rows]
        rows = db.table("profiles").select("*").in_("user_id", user_ids).limit(limit).offset(offset).execute().data
    else:
        rows = db.table("profiles").select("*").limit(limit).offset(offset).execute().data
    return rows


@router.post("", response_model=ProfileResponse, status_code=201)
async def create_profile(body: ProfileCreateRequest):
    db = get_supabase()
    existing = db.table("profiles").select("id").eq("user_id", body.user_id).limit(1).execute().data
    if existing:
        raise HTTPException(status_code=409, detail="Profile already exists for this user")
    row = db.table("profiles").insert(body.model_dump()).execute().data
    profile = row[0]

    try:
        user = _get_user(db, body.user_id)
        _publish_user_event("bl_create_user", profile, user)
    except Exception as e:
        logger.error(f"Failed to publish bl_create_user: {e}")

    return profile


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
    updated_profile = _get_profile(db, user_id)

    try:
        user = _get_user(db, user_id)
        _publish_user_event("bl_update_user", updated_profile, user)
    except Exception as e:
        logger.error(f"Failed to publish bl_update_user: {e}")

    return updated_profile
