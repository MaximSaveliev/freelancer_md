from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import CLIENT_ID, MOCK_PROJECT_ROW, PROJECT_ID, make_db

PROJECT_WITH_AVG_BID = {**MOCK_PROJECT_ROW, "avg_bid": 450}


def test_list_projects_basic_strips_avg_bid(client: TestClient):
    db = make_db([PROJECT_WITH_AVG_BID])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.get("/projects")
    assert resp.status_code == 200
    assert resp.json()[0]["avg_bid"] is None


def test_list_projects_premium_includes_avg_bid(client: TestClient):
    db = make_db([PROJECT_WITH_AVG_BID])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.get("/projects?user_plan=premium")
    assert resp.status_code == 200
    assert resp.json()[0]["avg_bid"] == 450


def test_list_projects_filter_by_user_id(client: TestClient):
    db = make_db([MOCK_PROJECT_ROW])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.get(f"/projects?user_id={CLIENT_ID}")
    assert resp.status_code == 200
    assert resp.json()[0]["user_id"] == CLIENT_ID


def test_list_projects_filter_by_status(client: TestClient):
    db = make_db([MOCK_PROJECT_ROW])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.get("/projects?status=OPEN")
    assert resp.status_code == 200


def test_create_project_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROJECT_ROW]),  # insert project
    ]
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.post("/projects", json={
            "user_id": CLIENT_ID,
            "title": "Build a website",
            "description": "A great project",
            "payment_type": "FIXED",
            "budget": {"amount": 500},
        })
    assert resp.status_code == 201
    assert resp.json()["id"] == PROJECT_ID


def test_create_project_with_skills(client: TestClient):
    from tests.helpers import SKILL_ID
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROJECT_ROW]),  # insert project
        MagicMock(data=[]),                   # insert skill 1
    ]
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.post("/projects", json={
            "user_id": CLIENT_ID,
            "title": "Build a website",
            "description": "A great project",
            "payment_type": "FIXED",
            "budget": {"amount": 500},
            "skill_ids": [SKILL_ID],
        })
    assert resp.status_code == 201


def test_get_project_success(client: TestClient):
    db = make_db([MOCK_PROJECT_ROW])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.get(f"/projects/{PROJECT_ID}")
    assert resp.status_code == 200
    assert resp.json()["id"] == PROJECT_ID


def test_get_project_strips_avg_bid_for_basic(client: TestClient):
    db = make_db([PROJECT_WITH_AVG_BID])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.get(f"/projects/{PROJECT_ID}")
    assert resp.status_code == 200
    assert resp.json()["avg_bid"] is None


def test_get_project_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.get(f"/projects/{PROJECT_ID}")
    assert resp.status_code == 404


def test_update_project_success(client: TestClient):
    updated = {**MOCK_PROJECT_ROW, "title": "Updated title"}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROJECT_ROW]),  # _get_project (ownership)
        MagicMock(data=[]),                   # update
        MagicMock(data=[updated]),            # _get_project (return fresh)
    ]
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.patch(f"/projects/{PROJECT_ID}?user_id={CLIENT_ID}", json={"title": "Updated title"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated title"


def test_update_project_wrong_owner(client: TestClient):
    db = make_db([MOCK_PROJECT_ROW])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.patch(f"/projects/{PROJECT_ID}?user_id=wrong-id", json={"title": "x"})
    assert resp.status_code == 403


def test_delete_project_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROJECT_ROW]),
        MagicMock(data=[]),
    ]
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.delete(f"/projects/{PROJECT_ID}?user_id={CLIENT_ID}")
    assert resp.status_code == 204


def test_delete_project_wrong_owner(client: TestClient):
    db = make_db([MOCK_PROJECT_ROW])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.delete(f"/projects/{PROJECT_ID}?user_id=wrong-id")
    assert resp.status_code == 403


def test_delete_project_not_open(client: TestClient):
    in_progress = {**MOCK_PROJECT_ROW, "status": "IN_PROGRESS"}
    db = make_db([in_progress])
    with patch("routers.projects.get_supabase", return_value=db):
        resp = client.delete(f"/projects/{PROJECT_ID}?user_id={CLIENT_ID}")
    assert resp.status_code == 400
