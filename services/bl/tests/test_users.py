from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import MOCK_USER_ROW, USER_ID, make_db


def test_create_user_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),
        MagicMock(data=[MOCK_USER_ROW]),
    ]
    with patch("routers.users.get_supabase", return_value=db):
        resp = client.post("/users", json={
            "id": USER_ID,
            "email": "test@example.com",
            "role": "FREELANCER",
        })
    assert resp.status_code == 201
    assert resp.json()["id"] == USER_ID


def test_create_user_conflict(client: TestClient):
    db = make_db([MOCK_USER_ROW])
    with patch("routers.users.get_supabase", return_value=db):
        resp = client.post("/users", json={
            "id": USER_ID,
            "email": "test@example.com",
            "role": "FREELANCER",
        })
    assert resp.status_code == 409


def test_get_user_success(client: TestClient):
    db = make_db([MOCK_USER_ROW])
    with patch("routers.users.get_supabase", return_value=db):
        resp = client.get(f"/users/{USER_ID}")
    assert resp.status_code == 200
    assert resp.json()["id"] == USER_ID
    assert resp.json()["email"] == "test@example.com"


def test_get_user_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.users.get_supabase", return_value=db):
        resp = client.get(f"/users/{USER_ID}")
    assert resp.status_code == 404


def test_get_user_by_email_success(client: TestClient):
    db = make_db([MOCK_USER_ROW])
    with patch("routers.users.get_supabase", return_value=db):
        resp = client.get("/users/by-email?email=test@example.com")
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"


def test_get_user_by_email_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.users.get_supabase", return_value=db):
        resp = client.get("/users/by-email?email=nobody@example.com")
    assert resp.status_code == 404
