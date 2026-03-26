import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_supabase
from models.schemas import (
    ProfileSkillAddRequest,
    ProfileSkillResponse,
    SkillCreateRequest,
    SkillResponse,
)

router = APIRouter(prefix="/skills", tags=["Skills"])
logger = logging.getLogger(__name__)


def _get_skill(db, skill_id: str) -> dict:
    rows = db.table("skills").select("*").eq("id", skill_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Skill not found")
    return rows[0]


@router.get("", response_model=list[SkillResponse])
async def list_skills(q: Optional[str] = Query(None)):
    db = get_supabase()
    query = db.table("skills").select("*")
    if q:
        query = query.ilike("name", f"%{q}%")
    rows = query.order("name").execute().data
    return rows


@router.post("", response_model=SkillResponse, status_code=201)
async def create_skill(body: SkillCreateRequest):
    db = get_supabase()
    existing = db.table("skills").select("id").eq("slug", body.slug).limit(1).execute().data
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")
    row = db.table("skills").insert(body.model_dump()).execute().data
    return row[0]


@router.get("/profile/{user_id}", response_model=list[ProfileSkillResponse])
async def list_profile_skills(user_id: str):
    db = get_supabase()
    rows = db.table("profile_skills").select("*, skills(name)").eq("user_id", user_id).execute().data
    # Flatten nested skills.name → skill_name
    for row in rows:
        nested = row.pop("skills", None)
        row["skill_name"] = nested["name"] if isinstance(nested, dict) else None
    return rows


@router.post("/profile", response_model=ProfileSkillResponse, status_code=201)
async def add_profile_skill(body: ProfileSkillAddRequest):
    db = get_supabase()
    existing = (
        db.table("profile_skills")
        .select("user_id")
        .eq("user_id", body.user_id)
        .eq("skill_id", body.skill_id)
        .limit(1)
        .execute()
        .data
    )
    if existing:
        raise HTTPException(status_code=409, detail="Skill already added to profile")
    row = db.table("profile_skills").insert(body.model_dump()).execute().data
    return row[0]


@router.delete("/profile", status_code=204)
async def remove_profile_skill(user_id: str = Query(...), skill_id: str = Query(...)):
    db = get_supabase()
    existing = (
        db.table("profile_skills")
        .select("user_id")
        .eq("user_id", user_id)
        .eq("skill_id", skill_id)
        .limit(1)
        .execute()
        .data
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Profile skill not found")
    db.table("profile_skills").delete().eq("user_id", user_id).eq("skill_id", skill_id).execute()


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(skill_id: str):
    db = get_supabase()
    return _get_skill(db, skill_id)
