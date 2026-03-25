import io
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import (
    MOCK_PORTFOLIO_ITEM_ROW,
    MOCK_PROFILE_ROW,
    PORTFOLIO_ITEM_ID,
    PROJECT_ID,
    USER_ID,
    make_db,
)

FAKE_URL = "https://ucvpixjzibbmgnjiccjs.supabase.co/storage/v1/object/public/avatars/test.jpg"
DOC_URL  = "https://ucvpixjzibbmgnjiccjs.supabase.co/storage/v1/object/public/documents/test.pdf"
DOC_ID   = "00000000-0000-0000-0000-000000000088"

MOCK_IMAGE_ROW = {
    "id": "00000000-0000-0000-0000-000000000087",
    "portfolio_item_id": PORTFOLIO_ITEM_ID,
    "url": FAKE_URL,
    "sort_order": 0,
    "created_at": "2026-03-25T00:00:00+00:00",
}

MOCK_DOC_ROW = {
    "id": DOC_ID,
    "user_id": USER_ID,
    "project_id": None,
    "portfolio_item_id": None,
    "filename": "invoice.pdf",
    "url": DOC_URL,
    "content_type": "application/pdf",
    "created_at": "2026-03-25T00:00:00+00:00",
}


def _make_file(content_type="image/jpeg", filename="test.jpg"):
    return ("file", (filename, io.BytesIO(b"fake-bytes"), content_type))


# ─── Avatar ───────────────────────────────────────────────────────────────────

def test_upload_avatar_success(client: TestClient):
    updated_profile = {**MOCK_PROFILE_ROW, "avatar_url": FAKE_URL}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROFILE_ROW]),
        MagicMock(data=[]),
        MagicMock(data=[updated_profile]),
    ]
    db.storage.from_.return_value.upload.return_value = MagicMock()
    db.storage.from_.return_value.get_public_url.return_value = FAKE_URL

    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/avatar/{USER_ID}?requester_id={USER_ID}",
            files=[_make_file()],
        )
    assert resp.status_code == 200
    assert resp.json()["avatar_url"] == FAKE_URL


def test_upload_avatar_wrong_owner(client: TestClient):
    db = make_db()
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(f"/uploads/avatar/{USER_ID}?requester_id=wrong", files=[_make_file()])
    assert resp.status_code == 403


def test_upload_avatar_invalid_type(client: TestClient):
    db = make_db()
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/avatar/{USER_ID}?requester_id={USER_ID}",
            files=[_make_file(content_type="text/plain", filename="x.txt")],
        )
    assert resp.status_code == 400


def test_upload_avatar_profile_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(f"/uploads/avatar/{USER_ID}?requester_id={USER_ID}", files=[_make_file()])
    assert resp.status_code == 404


# ─── Portfolio image ──────────────────────────────────────────────────────────

def test_upload_portfolio_image_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PORTFOLIO_ITEM_ROW]),
        MagicMock(data=[MOCK_IMAGE_ROW]),
    ]
    db.storage.from_.return_value.upload.return_value = MagicMock()
    db.storage.from_.return_value.get_public_url.return_value = FAKE_URL

    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/portfolio/{PORTFOLIO_ITEM_ID}?user_id={USER_ID}",
            files=[_make_file()],
        )
    assert resp.status_code == 201
    assert resp.json()["url"] == FAKE_URL


def test_upload_portfolio_image_wrong_owner(client: TestClient):
    db = make_db([MOCK_PORTFOLIO_ITEM_ROW])
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/portfolio/{PORTFOLIO_ITEM_ID}?user_id=wrong",
            files=[_make_file()],
        )
    assert resp.status_code == 403


def test_upload_portfolio_image_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/portfolio/{PORTFOLIO_ITEM_ID}?user_id={USER_ID}",
            files=[_make_file()],
        )
    assert resp.status_code == 404


def test_upload_portfolio_image_invalid_type(client: TestClient):
    db = make_db()
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/portfolio/{PORTFOLIO_ITEM_ID}?user_id={USER_ID}",
            files=[_make_file(content_type="application/pdf", filename="x.pdf")],
        )
    assert resp.status_code == 400


# ─── Documents ────────────────────────────────────────────────────────────────

def test_upload_document_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [MagicMock(data=[MOCK_DOC_ROW])]
    db.storage.from_.return_value.upload.return_value = MagicMock()
    db.storage.from_.return_value.get_public_url.return_value = DOC_URL

    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/documents/{USER_ID}?requester_id={USER_ID}",
            files=[_make_file(content_type="application/pdf", filename="invoice.pdf")],
        )
    assert resp.status_code == 201
    assert resp.json()["filename"] == "invoice.pdf"
    assert resp.json()["url"] == DOC_URL


def test_upload_document_wrong_owner(client: TestClient):
    db = make_db()
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/documents/{USER_ID}?requester_id=wrong",
            files=[_make_file(content_type="application/pdf", filename="x.pdf")],
        )
    assert resp.status_code == 403


def test_upload_document_invalid_type(client: TestClient):
    db = make_db()
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/documents/{USER_ID}?requester_id={USER_ID}",
            files=[_make_file(content_type="image/jpeg", filename="photo.jpg")],
        )
    assert resp.status_code == 400


def test_upload_document_with_project_ref(client: TestClient):
    doc_row = {**MOCK_DOC_ROW, "project_id": PROJECT_ID}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [MagicMock(data=[doc_row])]
    db.storage.from_.return_value.upload.return_value = MagicMock()
    db.storage.from_.return_value.get_public_url.return_value = DOC_URL

    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/documents/{USER_ID}?requester_id={USER_ID}&project_id={PROJECT_ID}",
            files=[_make_file(content_type="application/pdf", filename="contract.pdf")],
        )
    assert resp.status_code == 201
    assert resp.json()["project_id"] == PROJECT_ID


def test_upload_document_with_portfolio_ref(client: TestClient):
    doc_row = {**MOCK_DOC_ROW, "portfolio_item_id": PORTFOLIO_ITEM_ID}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [MagicMock(data=[doc_row])]
    db.storage.from_.return_value.upload.return_value = MagicMock()
    db.storage.from_.return_value.get_public_url.return_value = DOC_URL

    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.post(
            f"/uploads/documents/{USER_ID}?requester_id={USER_ID}&portfolio_item_id={PORTFOLIO_ITEM_ID}",
            files=[_make_file(content_type="application/pdf", filename="case-study.pdf")],
        )
    assert resp.status_code == 201
    assert resp.json()["portfolio_item_id"] == PORTFOLIO_ITEM_ID


def test_list_documents(client: TestClient):
    db = make_db([MOCK_DOC_ROW])
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.get(f"/uploads/documents/{USER_ID}")
    assert resp.status_code == 200
    assert resp.json()[0]["id"] == DOC_ID


def test_delete_document_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_DOC_ROW]),
        MagicMock(data=[]),
    ]
    db.storage.from_.return_value.remove.return_value = MagicMock()

    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.delete(f"/uploads/documents/{DOC_ID}?user_id={USER_ID}")
    assert resp.status_code == 204


def test_delete_document_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.delete(f"/uploads/documents/{DOC_ID}?user_id={USER_ID}")
    assert resp.status_code == 404


def test_delete_document_wrong_owner(client: TestClient):
    db = make_db([MOCK_DOC_ROW])
    with patch("routers.uploads.get_supabase", return_value=db):
        resp = client.delete(f"/uploads/documents/{DOC_ID}?user_id=wrong")
    assert resp.status_code == 403
