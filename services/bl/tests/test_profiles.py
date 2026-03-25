from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import MOCK_PROFILE_ROW, USER_ID, make_db


def test_create_profile_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),
        MagicMock(data=[MOCK_PROFILE_ROW]),
    ]
    with patch("routers.profiles.get_supabase", return_value=db):
        resp = client.post("/profiles", json={
            "user_id": USER_ID,
            "first_name": "Test",
            "last_name": "User",
        })
    assert resp.status_code == 201
    assert resp.json()["user_id"] == USER_ID


def test_create_profile_conflict(client: TestClient):
    db = make_db([MOCK_PROFILE_ROW])
    with patch("routers.profiles.get_supabase", return_value=db):
        resp = client.post("/profiles", json={
            "user_id": USER_ID,
            "first_name": "Test",
            "last_name": "User",
        })
    assert resp.status_code == 409


def test_get_profile_success(client: TestClient):
    db = make_db([MOCK_PROFILE_ROW])
    with patch("routers.profiles.get_supabase", return_value=db):
        resp = client.get(f"/profiles/{USER_ID}")
    assert resp.status_code == 200
    assert resp.json()["user_id"] == USER_ID


def test_get_profile_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.profiles.get_supabase", return_value=db):
        resp = client.get(f"/profiles/{USER_ID}")
    assert resp.status_code == 404


def test_update_profile_success(client: TestClient):
    updated = {**MOCK_PROFILE_ROW, "bio": "Updated bio"}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROFILE_ROW]),  # _get_profile (ownership check)
        MagicMock(data=[]),                   # update
        MagicMock(data=[updated]),            # _get_profile (return fresh)
    ]
    with patch("routers.profiles.get_supabase", return_value=db):
        resp = client.patch(f"/profiles/{USER_ID}?requester_id={USER_ID}", json={"bio": "Updated bio"})
    assert resp.status_code == 200
    assert resp.json()["bio"] == "Updated bio"


def test_update_profile_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.profiles.get_supabase", return_value=db):
        resp = client.patch(f"/profiles/{USER_ID}?requester_id={USER_ID}", json={"bio": "x"})
    assert resp.status_code == 404


def test_update_profile_wrong_owner(client: TestClient):
    db = make_db([MOCK_PROFILE_ROW])
    with patch("routers.profiles.get_supabase", return_value=db):
        resp = client.patch(
            f"/profiles/{USER_ID}?requester_id=00000000-0000-0000-0000-000000000099",
            json={"bio": "x"},
        )
    assert resp.status_code == 403
