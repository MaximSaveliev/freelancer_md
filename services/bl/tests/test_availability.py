from unittest.mock import patch

from fastapi.testclient import TestClient

from tests.helpers import USER_ID, make_db

MOCK_AVAILABILITY_ROW = {
    "user_id": USER_ID,
    "date": "2026-04-01",
    "is_available": True,
}


def test_get_availability(client: TestClient):
    db = make_db([MOCK_AVAILABILITY_ROW])
    with patch("routers.availability.get_supabase", return_value=db):
        resp = client.get(f"/availability/{USER_ID}")
    assert resp.status_code == 200
    assert resp.json()[0]["date"] == "2026-04-01"


def test_get_availability_with_date_range(client: TestClient):
    db = make_db([MOCK_AVAILABILITY_ROW])
    with patch("routers.availability.get_supabase", return_value=db):
        resp = client.get(f"/availability/{USER_ID}?from_date=2026-04-01&to_date=2026-04-30")
    assert resp.status_code == 200


def test_set_availability(client: TestClient):
    db = make_db([MOCK_AVAILABILITY_ROW])
    with patch("routers.availability.get_supabase", return_value=db):
        resp = client.post("/availability", json={
            "user_id": USER_ID,
            "date": "2026-04-01",
            "is_available": True,
        })
    assert resp.status_code == 200
    assert resp.json()["is_available"] is True


def test_delete_availability(client: TestClient):
    db = make_db([])
    with patch("routers.availability.get_supabase", return_value=db):
        resp = client.delete(f"/availability?user_id={USER_ID}&date=2026-04-01")
    assert resp.status_code == 204
