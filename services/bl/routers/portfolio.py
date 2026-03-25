import logging

from fastapi import APIRouter, HTTPException, Query, Response

from database import get_supabase
from models.schemas import (
    PortfolioImageAddRequest,
    PortfolioImageResponse,
    PortfolioItemCreateRequest,
    PortfolioItemResponse,
    PortfolioItemUpdateRequest,
)

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])
logger = logging.getLogger(__name__)


def _get_item(db, item_id: str) -> dict:
    rows = db.table("portfolio_items").select("*").eq("id", item_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return rows[0]


def _assert_owner(item: dict, user_id: str) -> None:
    if item["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")


@router.get("/{user_id}", response_model=list[PortfolioItemResponse])
async def list_portfolio_items(user_id: str):
    db = get_supabase()
    rows = db.table("portfolio_items").select("*").eq("user_id", user_id).order("created_at").execute().data
    return rows


@router.post("", response_model=PortfolioItemResponse, status_code=201)
async def create_portfolio_item(body: PortfolioItemCreateRequest):
    db = get_supabase()
    row = db.table("portfolio_items").insert(body.model_dump()).execute().data
    return row[0]


@router.patch("/{item_id}", response_model=PortfolioItemResponse)
async def update_portfolio_item(item_id: str, body: PortfolioItemUpdateRequest, user_id: str = Query(...)):
    db = get_supabase()
    item = _get_item(db, item_id)
    _assert_owner(item, user_id)
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        return item
    db.table("portfolio_items").update(updates).eq("id", item_id).execute()
    return _get_item(db, item_id)


@router.delete("/{item_id}", status_code=204)
async def delete_portfolio_item(item_id: str, user_id: str = Query(...)):
    db = get_supabase()
    item = _get_item(db, item_id)
    _assert_owner(item, user_id)
    db.table("portfolio_items").delete().eq("id", item_id).execute()
    return Response(status_code=204)


@router.get("/{item_id}/images", response_model=list[PortfolioImageResponse])
async def list_portfolio_images(item_id: str):
    db = get_supabase()
    rows = (
        db.table("portfolio_images")
        .select("*")
        .eq("portfolio_item_id", item_id)
        .order("sort_order")
        .execute()
        .data
    )
    return rows


@router.post("/{item_id}/images", response_model=PortfolioImageResponse, status_code=201)
async def add_portfolio_image(item_id: str, body: PortfolioImageAddRequest, user_id: str = Query(...)):
    db = get_supabase()
    item = _get_item(db, item_id)
    _assert_owner(item, user_id)
    row = db.table("portfolio_images").insert({
        "portfolio_item_id": item_id,
        "url": body.url,
        "sort_order": body.sort_order,
    }).execute().data
    return row[0]


@router.delete("/{item_id}/images/{image_id}", status_code=204)
async def delete_portfolio_image(item_id: str, image_id: str, user_id: str = Query(...)):
    db = get_supabase()
    item = _get_item(db, item_id)
    _assert_owner(item, user_id)
    rows = db.table("portfolio_images").select("id").eq("id", image_id).eq("portfolio_item_id", item_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Image not found")
    db.table("portfolio_images").delete().eq("id", image_id).execute()
    return Response(status_code=204)
