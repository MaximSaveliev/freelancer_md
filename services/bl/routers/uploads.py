import logging
import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, UploadFile
from fastapi.responses import Response

from database import get_supabase
from models.schemas import DocumentResponse, PortfolioImageResponse, ProfileResponse

router = APIRouter(prefix="/uploads", tags=["Uploads"])
logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_DOC_TYPES   = {"application/pdf", "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}


def _upload(db, bucket: str, path: str, file: UploadFile) -> str:
    content = file.file.read()
    db.storage.from_(bucket).upload(path, content, {"content-type": file.content_type})
    return db.storage.from_(bucket).get_public_url(path)


def _unique_path(prefix: str, filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    return f"{prefix}/{uuid.uuid4()}.{ext}"


@router.post("/avatar/{user_id}", response_model=ProfileResponse)
async def upload_avatar(user_id: str, file: UploadFile, requester_id: str = Query(...)):
    if user_id != requester_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {file.content_type}")

    db = get_supabase()
    rows = db.table("profiles").select("*").eq("user_id", user_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Profile not found")

    path = _unique_path(user_id, file.filename or "avatar")
    url = _upload(db, "avatars", path, file)

    db.table("profiles").update({"avatar_url": url}).eq("user_id", user_id).execute()
    rows = db.table("profiles").select("*").eq("user_id", user_id).limit(1).execute().data
    return rows[0]


@router.post("/portfolio/{item_id}", response_model=PortfolioImageResponse, status_code=201)
async def upload_portfolio_image(item_id: str, file: UploadFile, user_id: str = Query(...), sort_order: int = Query(0)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {file.content_type}")

    db = get_supabase()
    rows = db.table("portfolio_items").select("*").eq("id", item_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    if rows[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    path = _unique_path(item_id, file.filename or "image")
    url = _upload(db, "portfolio", path, file)

    row = db.table("portfolio_images").insert({
        "portfolio_item_id": item_id,
        "url": url,
        "sort_order": sort_order,
    }).execute().data
    return row[0]


@router.post("/documents/{user_id}", response_model=DocumentResponse, status_code=201)
async def upload_document(
    user_id: str,
    file: UploadFile,
    requester_id: str = Query(...),
    project_id: Optional[str] = Query(None),
    portfolio_item_id: Optional[str] = Query(None),
):
    if user_id != requester_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {file.content_type}")

    db = get_supabase()
    path = _unique_path(user_id, file.filename or "document")
    url = _upload(db, "documents", path, file)

    payload: dict = {
        "user_id": user_id,
        "filename": file.filename or "document",
        "url": url,
        "content_type": file.content_type,
    }
    if project_id:
        payload["project_id"] = project_id
    if portfolio_item_id:
        payload["portfolio_item_id"] = portfolio_item_id

    row = db.table("user_documents").insert(payload).execute().data
    return row[0]


@router.get("/documents/{user_id}", response_model=list[DocumentResponse])
async def list_documents(user_id: str):
    db = get_supabase()
    rows = db.table("user_documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute().data
    return rows


@router.delete("/documents/{document_id}", status_code=204)
async def delete_document(document_id: str, user_id: str = Query(...)):
    db = get_supabase()
    rows = db.table("user_documents").select("*").eq("id", document_id).limit(1).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Document not found")
    if rows[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    doc = rows[0]
    path = doc["url"].split("/object/public/documents/")[-1]
    try:
        db.storage.from_("documents").remove([path])
    except Exception:
        logger.warning("Storage delete failed for %s", path)

    db.table("user_documents").delete().eq("id", document_id).execute()
    return Response(status_code=204)
