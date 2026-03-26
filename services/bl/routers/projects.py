import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Response

from database import get_supabase
from models.schemas import (
    ProjectCreateRequest,
    ProjectResponse,
    ProjectUpdateRequest,
)

router = APIRouter(prefix="/projects", tags=["Projects"])
logger = logging.getLogger(__name__)


def _get_project(db, project_id: str) -> dict:
    rows = db.table("projects").select("*").eq("id", project_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Project not found")
    return rows[0]


def _assert_owner(project: dict, user_id: str) -> None:
    if project["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")


def _strip_avg_bid(project: dict, user_plan: str) -> dict:
    if user_plan not in ("pro", "premium"):
        project = {**project}
        project.pop("avg_bid", None)
    return project


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    user_plan: str = Query("basic"),
    user_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    payment_type: Optional[str] = Query(None),
    required_grade: Optional[str] = Query(None),
    is_urgent: Optional[bool] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    db = get_supabase()
    query = db.table("projects").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
    if status:
        query = query.eq("status", status)
    if category_id:
        query = query.eq("category_id", category_id)
    if payment_type:
        query = query.eq("payment_type", payment_type)
    if required_grade:
        query = query.eq("required_grade", required_grade)
    if is_urgent is not None:
        query = query.eq("is_urgent", is_urgent)
    rows = query.order("created_at", desc=True).limit(limit).offset(offset).execute().data
    return [_strip_avg_bid(r, user_plan) for r in rows]


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(body: ProjectCreateRequest):
    db = get_supabase()
    skill_ids = body.skill_ids
    payload = body.model_dump(exclude={"skill_ids"})
    row = db.table("projects").insert(payload).execute().data
    project = row[0]
    for skill_id in skill_ids:
        db.table("project_skills").insert({"project_id": project["id"], "skill_id": skill_id}).execute()
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, user_plan: str = Query("basic")):
    db = get_supabase()
    project = _get_project(db, project_id)
    return _strip_avg_bid(project, user_plan)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, body: ProjectUpdateRequest, user_id: str = Query(...)):
    db = get_supabase()
    project = _get_project(db, project_id)
    _assert_owner(project, user_id)
    updates = body.model_dump(mode="json", exclude_unset=True)
    if not updates:
        return project
    db.table("projects").update(updates).eq("id", project_id).execute()
    return _get_project(db, project_id)


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, user_id: str = Query(...)):
    db = get_supabase()
    project = _get_project(db, project_id)
    _assert_owner(project, user_id)
    if project["status"] != "OPEN":
        raise HTTPException(status_code=400, detail="Only OPEN projects can be deleted")
    db.table("projects").delete().eq("id", project_id).execute()
    return Response(status_code=204)
