from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import FREELANCER_ID, MOCK_SKILL_ROW, SKILL_ID, make_db

MOCK_PROFILE_SKILL_ROW = {
    "user_id": FREELANCER_ID,
    "skill_id": SKILL_ID,
    "proficiency": "JUNIOR",
    "created_at": "2026-03-25T00:00:00+00:00",
    "updated_at": "2026-03-25T00:00:00+00:00",
}


def test_list_skills(client: TestClient):
    db = make_db([MOCK_SKILL_ROW])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.get("/skills")
    assert resp.status_code == 200
    assert resp.json()[0]["slug"] == "python"


def test_list_skills_with_search(client: TestClient):
    db = make_db([MOCK_SKILL_ROW])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.get("/skills?q=py")
    assert resp.status_code == 200


def test_create_skill_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),
        MagicMock(data=[MOCK_SKILL_ROW]),
    ]
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.post("/skills", json={"name": "Python", "slug": "python"})
    assert resp.status_code == 201
    assert resp.json()["id"] == SKILL_ID


def test_create_skill_conflict(client: TestClient):
    db = make_db([MOCK_SKILL_ROW])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.post("/skills", json={"name": "Python", "slug": "python"})
    assert resp.status_code == 409


def test_get_skill_success(client: TestClient):
    db = make_db([MOCK_SKILL_ROW])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.get(f"/skills/{SKILL_ID}")
    assert resp.status_code == 200
    assert resp.json()["id"] == SKILL_ID


def test_get_skill_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.get(f"/skills/{SKILL_ID}")
    assert resp.status_code == 404


def test_list_profile_skills(client: TestClient):
    db = make_db([MOCK_PROFILE_SKILL_ROW])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.get(f"/skills/profile/{FREELANCER_ID}")
    assert resp.status_code == 200
    assert resp.json()[0]["skill_id"] == SKILL_ID


def test_add_profile_skill_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),
        MagicMock(data=[MOCK_PROFILE_SKILL_ROW]),
    ]
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.post("/skills/profile", json={
            "user_id": FREELANCER_ID,
            "skill_id": SKILL_ID,
            "proficiency": "JUNIOR",
        })
    assert resp.status_code == 201
    assert resp.json()["skill_id"] == SKILL_ID


def test_add_profile_skill_conflict(client: TestClient):
    db = make_db([MOCK_PROFILE_SKILL_ROW])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.post("/skills/profile", json={
            "user_id": FREELANCER_ID,
            "skill_id": SKILL_ID,
        })
    assert resp.status_code == 409


def test_remove_profile_skill_success(client: TestClient):
    db = make_db([MOCK_PROFILE_SKILL_ROW])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.delete(f"/skills/profile?user_id={FREELANCER_ID}&skill_id={SKILL_ID}")
    assert resp.status_code == 204


def test_remove_profile_skill_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.skills.get_supabase", return_value=db):
        resp = client.delete(f"/skills/profile?user_id={FREELANCER_ID}&skill_id={SKILL_ID}")
    assert resp.status_code == 404
