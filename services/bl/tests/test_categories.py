from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import CATEGORY_ID, MOCK_CATEGORY_ROW, make_db


def test_list_categories(client: TestClient):
    db = make_db([MOCK_CATEGORY_ROW])
    with patch("routers.categories.get_supabase", return_value=db):
        resp = client.get("/categories")
    assert resp.status_code == 200
    assert resp.json()[0]["slug"] == "web-development"


def test_create_category_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),           # slug check — not found
        MagicMock(data=[MOCK_CATEGORY_ROW]),  # insert
    ]
    with patch("routers.categories.get_supabase", return_value=db):
        resp = client.post("/categories", json={"name": "Web Development", "slug": "web-development"})
    assert resp.status_code == 201
    assert resp.json()["id"] == CATEGORY_ID


def test_create_category_conflict(client: TestClient):
    db = make_db([MOCK_CATEGORY_ROW])
    with patch("routers.categories.get_supabase", return_value=db):
        resp = client.post("/categories", json={"name": "Web Development", "slug": "web-development"})
    assert resp.status_code == 409


def test_get_category_success(client: TestClient):
    db = make_db([MOCK_CATEGORY_ROW])
    with patch("routers.categories.get_supabase", return_value=db):
        resp = client.get(f"/categories/{CATEGORY_ID}")
    assert resp.status_code == 200
    assert resp.json()["id"] == CATEGORY_ID


def test_get_category_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.categories.get_supabase", return_value=db):
        resp = client.get(f"/categories/{CATEGORY_ID}")
    assert resp.status_code == 404
