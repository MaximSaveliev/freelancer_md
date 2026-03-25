import logging

from fastapi import APIRouter, HTTPException, Query, Response

from database import get_supabase
from models.schemas import BidCreateRequest, BidResponse, BidUpdateStatusRequest

router = APIRouter(tags=["Bids"])
logger = logging.getLogger(__name__)


def _get_project(db, project_id: str) -> dict:
    rows = db.table("projects").select("*").eq("id", project_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Project not found")
    return rows[0]


def _get_bid(db, bid_id: str) -> dict:
    rows = db.table("bids").select("*").eq("id", bid_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Bid not found")
    return rows[0]


def _update_project_bid_stats(db, project_id: str) -> None:
    rows = db.table("bids").select("amount").eq("project_id", project_id).execute().data
    count = len(rows)
    avg = int(sum(r["amount"] for r in rows) / count) if count else None
    db.table("projects").update({"bid_count": count, "avg_bid": avg}).eq("id", project_id).execute()


@router.get("/projects/{project_id}/bids", response_model=list[BidResponse])
async def list_bids(project_id: str):
    db = get_supabase()
    rows = db.table("bids").select("*").eq("project_id", project_id).order("created_at").execute().data
    return rows


@router.post("/projects/{project_id}/bids", response_model=BidResponse, status_code=201)
async def create_bid(project_id: str, body: BidCreateRequest):
    db = get_supabase()
    project = _get_project(db, project_id)
    if project["status"] != "OPEN":
        raise HTTPException(status_code=400, detail="Project is not open for bids")
    existing = (
        db.table("bids")
        .select("id")
        .eq("project_id", project_id)
        .eq("user_id", body.user_id)
        .limit(1)
        .execute()
        .data
    )
    if existing:
        raise HTTPException(status_code=409, detail="You already placed a bid on this project")
    payload = {"project_id": project_id, **body.model_dump()}
    row = db.table("bids").insert(payload).execute().data
    bid = row[0]
    _update_project_bid_stats(db, project_id)
    return bid


@router.get("/projects/{project_id}/bids/{bid_id}", response_model=BidResponse)
async def get_bid(project_id: str, bid_id: str):
    db = get_supabase()
    return _get_bid(db, bid_id)


@router.patch("/projects/{project_id}/bids/{bid_id}/status", response_model=BidResponse)
async def update_bid_status(project_id: str, bid_id: str, body: BidUpdateStatusRequest, user_id: str = Query(...)):
    db = get_supabase()
    project = _get_project(db, project_id)
    if project["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the project owner can update bid status")
    bid = _get_bid(db, bid_id)
    db.table("bids").update({"status": body.status}).eq("id", bid_id).execute()
    return _get_bid(db, bid_id)


@router.delete("/projects/{project_id}/bids/{bid_id}", status_code=204)
async def withdraw_bid(project_id: str, bid_id: str, user_id: str = Query(...)):
    db = get_supabase()
    bid = _get_bid(db, bid_id)
    if bid["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="You can only withdraw your own bid")
    if bid["status"] != "PENDING":
        raise HTTPException(status_code=400, detail="Only PENDING bids can be withdrawn")
    db.table("bids").delete().eq("id", bid_id).execute()
    _update_project_bid_stats(db, project_id)
    return Response(status_code=204)
