from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import MOCK_PROJECT_ROW, PROJECT_ID, USER_ID, make_db

MOCK_BOOKMARK_ROW = {
    "user_id": USER_ID,
    "project_id": PROJECT_ID,
    "created_at": "2026-03-25T00:00:00+00:00",
}


def test_list_bookmarks_empty(client: TestClient):
    db = make_db([])
    with patch("routers.bookmarks.get_supabase", return_value=db):
        resp = client.get(f"/bookmarks?user_id={USER_ID}")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_bookmarks_with_projects(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[{"project_id": PROJECT_ID}]),
        MagicMock(data=[MOCK_PROJECT_ROW]),
    ]
    with patch("routers.bookmarks.get_supabase", return_value=db):
        resp = client.get(f"/bookmarks?user_id={USER_ID}")
    assert resp.status_code == 200
    assert resp.json()[0]["id"] == PROJECT_ID


def test_add_bookmark_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),
        MagicMock(data=[MOCK_BOOKMARK_ROW]),
    ]
    with patch("routers.bookmarks.get_supabase", return_value=db):
        resp = client.post(f"/bookmarks/{PROJECT_ID}?user_id={USER_ID}")
    assert resp.status_code == 201
    assert resp.json()["project_id"] == PROJECT_ID


def test_add_bookmark_conflict(client: TestClient):
    db = make_db([MOCK_BOOKMARK_ROW])
    with patch("routers.bookmarks.get_supabase", return_value=db):
        resp = client.post(f"/bookmarks/{PROJECT_ID}?user_id={USER_ID}")
    assert resp.status_code == 409


def test_remove_bookmark_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_BOOKMARK_ROW]),
        MagicMock(data=[]),
    ]
    with patch("routers.bookmarks.get_supabase", return_value=db):
        resp = client.delete(f"/bookmarks/{PROJECT_ID}?user_id={USER_ID}")
    assert resp.status_code == 204


def test_remove_bookmark_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.bookmarks.get_supabase", return_value=db):
        resp = client.delete(f"/bookmarks/{PROJECT_ID}?user_id={USER_ID}")
    assert resp.status_code == 404
