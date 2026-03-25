import logging

from fastapi import APIRouter, HTTPException

from database import get_supabase
from models.schemas import UserCreateRequest, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])
logger = logging.getLogger(__name__)


def _get_user(db, user_id: str) -> dict:
    rows = db.table("users").select("*").eq("id", user_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    return rows[0]


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(body: UserCreateRequest):
    db = get_supabase()
    existing = db.table("users").select("id").eq("id", body.id).limit(1).execute().data
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    payload = body.model_dump()
    payload["password_hash"] = ""
    row = db.table("users").insert(payload).execute().data
    return row[0]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    db = get_supabase()
    return _get_user(db, user_id)
