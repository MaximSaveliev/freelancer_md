import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from database import get_supabase
from models.schemas import InvitationCreateRequest, InvitationRespondRequest, InvitationResponse

router = APIRouter(tags=["Invitations"])
logger = logging.getLogger(__name__)


def _get_invitation(db, invitation_id: str) -> dict:
    rows = db.table("project_invitations").select("*").eq("id", invitation_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return rows[0]


@router.get("/invitations", response_model=list[InvitationResponse])
async def list_invitations(user_id: str = Query(...), role: Optional[str] = Query(None)):
    db = get_supabase()
    query = db.table("project_invitations").select("*")
    if role == "client":
        query = query.eq("client_id", user_id)
    else:
        query = query.eq("freelancer_id", user_id)
    rows = query.order("created_at", desc=True).execute().data
    return rows


@router.post("/projects/{project_id}/invitations", response_model=InvitationResponse, status_code=201)
async def send_invitation(project_id: str, body: InvitationCreateRequest):
    db = get_supabase()
    existing = (
        db.table("project_invitations")
        .select("id")
        .eq("project_id", project_id)
        .eq("freelancer_id", body.freelancer_id)
        .limit(1)
        .execute()
        .data
    )
    if existing:
        raise HTTPException(status_code=409, detail="Invitation already sent to this freelancer")
    payload = {"project_id": project_id, **body.model_dump()}
    row = db.table("project_invitations").insert(payload).execute().data
    return row[0]


@router.patch("/invitations/{invitation_id}/respond", response_model=InvitationResponse)
async def respond_to_invitation(invitation_id: str, body: InvitationRespondRequest, user_id: str = Query(...)):
    db = get_supabase()
    invitation = _get_invitation(db, invitation_id)
    if invitation["freelancer_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the invited freelancer can respond")
    if invitation["status"] != "PENDING":
        raise HTTPException(status_code=400, detail="Invitation is no longer pending")
    db.table("project_invitations").update({"status": body.status}).eq("id", invitation_id).execute()
    return _get_invitation(db, invitation_id)
