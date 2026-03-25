from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import (
    CLIENT_ID,
    FREELANCER_ID,
    MOCK_REVIEW_ROW,
    PROJECT_ID,
    REVIEW_ID,
    make_db,
)


def test_list_user_reviews(client: TestClient):
    db = make_db([MOCK_REVIEW_ROW])
    with patch("routers.reviews.get_supabase", return_value=db):
        resp = client.get(f"/reviews/{FREELANCER_ID}")
    assert resp.status_code == 200
    assert resp.json()[0]["id"] == REVIEW_ID


def test_list_project_reviews(client: TestClient):
    db = make_db([MOCK_REVIEW_ROW])
    with patch("routers.reviews.get_supabase", return_value=db):
        resp = client.get(f"/projects/{PROJECT_ID}/reviews")
    assert resp.status_code == 200


def test_create_review_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),               # duplicate check
        MagicMock(data=[MOCK_REVIEW_ROW]),# insert
        MagicMock(data=[{"score": 5}]),   # _update_profile_rating: fetch reviews
        MagicMock(data=[]),               # _update_profile_rating: update profile
    ]
    with patch("routers.reviews.get_supabase", return_value=db):
        resp = client.post(f"/projects/{PROJECT_ID}/reviews", json={
            "author_id": CLIENT_ID,
            "target_id": FREELANCER_ID,
            "score": 5,
            "text": "Great work",
        })
    assert resp.status_code == 201
    assert resp.json()["score"] == 5


def test_create_review_conflict(client: TestClient):
    db = make_db([MOCK_REVIEW_ROW])
    with patch("routers.reviews.get_supabase", return_value=db):
        resp = client.post(f"/projects/{PROJECT_ID}/reviews", json={
            "author_id": CLIENT_ID,
            "target_id": FREELANCER_ID,
            "score": 5,
        })
    assert resp.status_code == 409


def test_create_review_invalid_score(client: TestClient):
    db = make_db([])
    with patch("routers.reviews.get_supabase", return_value=db):
        resp = client.post(f"/projects/{PROJECT_ID}/reviews", json={
            "author_id": CLIENT_ID,
            "target_id": FREELANCER_ID,
            "score": 6,
        })
    assert resp.status_code == 422
