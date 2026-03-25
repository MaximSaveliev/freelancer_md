import logging

from fastapi import APIRouter, HTTPException, Query, Response

from database import get_supabase
from models.schemas import BookmarkResponse, ProjectResponse

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])
logger = logging.getLogger(__name__)


@router.get("", response_model=list[ProjectResponse])
async def list_bookmarks(user_id: str = Query(...)):
    db = get_supabase()
    bookmark_rows = db.table("bookmarks").select("project_id").eq("user_id", user_id).execute().data
    project_ids = [r["project_id"] for r in bookmark_rows]
    if not project_ids:
        return []
    projects = db.table("projects").select("*").in_("id", project_ids).execute().data
    return projects


@router.post("/{project_id}", response_model=BookmarkResponse, status_code=201)
async def add_bookmark(project_id: str, user_id: str = Query(...)):
    db = get_supabase()
    existing = (
        db.table("bookmarks")
        .select("user_id")
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .limit(1)
        .execute()
        .data
    )
    if existing:
        raise HTTPException(status_code=409, detail="Project already bookmarked")
    row = db.table("bookmarks").insert({"user_id": user_id, "project_id": project_id}).execute().data
    return row[0]


@router.delete("/{project_id}", status_code=204)
async def remove_bookmark(project_id: str, user_id: str = Query(...)):
    db = get_supabase()
    existing = (
        db.table("bookmarks")
        .select("user_id")
        .eq("user_id", user_id)
        .eq("project_id", project_id)
        .limit(1)
        .execute()
        .data
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    db.table("bookmarks").delete().eq("user_id", user_id).eq("project_id", project_id).execute()
    return Response(status_code=204)
