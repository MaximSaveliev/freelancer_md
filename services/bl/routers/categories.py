import logging

from fastapi import APIRouter, HTTPException

from database import get_supabase
from models.schemas import CategoryCreateRequest, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])
logger = logging.getLogger(__name__)


def _get_category(db, category_id: str) -> dict:
    rows = db.table("categories").select("*").eq("id", category_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Category not found")
    return rows[0]


@router.get("", response_model=list[CategoryResponse])
async def list_categories():
    db = get_supabase()
    rows = db.table("categories").select("*").order("name").execute().data
    return rows


@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(body: CategoryCreateRequest):
    db = get_supabase()
    existing = db.table("categories").select("id").eq("slug", body.slug).limit(1).execute().data
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")
    row = db.table("categories").insert(body.model_dump()).execute().data
    return row[0]


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    db = get_supabase()
    return _get_category(db, category_id)
