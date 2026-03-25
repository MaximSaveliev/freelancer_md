import logging
from typing import Optional

from fastapi import APIRouter, Query, Response

from database import get_supabase
from models.schemas import AvailabilityResponse, AvailabilitySetRequest

router = APIRouter(prefix="/availability", tags=["Availability"])
logger = logging.getLogger(__name__)


@router.get("/{user_id}", response_model=list[AvailabilityResponse])
async def get_availability(
    user_id: str,
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
):
    db = get_supabase()
    query = db.table("availability").select("*").eq("user_id", user_id)
    if from_date:
        query = query.gte("date", from_date)
    if to_date:
        query = query.lte("date", to_date)
    rows = query.order("date").execute().data
    return rows


@router.post("", response_model=AvailabilityResponse)
async def set_availability(body: AvailabilitySetRequest):
    db = get_supabase()
    payload = {
        "user_id": body.user_id,
        "date": body.date.isoformat(),
        "is_available": body.is_available,
    }
    rows = db.table("availability").upsert(payload).execute().data
    return rows[0]


@router.delete("", status_code=204)
async def delete_availability(user_id: str = Query(...), date: str = Query(...)):
    db = get_supabase()
    db.table("availability").delete().eq("user_id", user_id).eq("date", date).execute()
    return Response(status_code=204)
