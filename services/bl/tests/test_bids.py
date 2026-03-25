from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import (
    BID_ID,
    CLIENT_ID,
    FREELANCER_ID,
    MOCK_BID_ROW,
    MOCK_PROJECT_ROW,
    PROJECT_ID,
    make_db,
)


def test_list_bids(client: TestClient):
    db = make_db([MOCK_BID_ROW])
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.get(f"/projects/{PROJECT_ID}/bids")
    assert resp.status_code == 200
    assert resp.json()[0]["id"] == BID_ID


def test_create_bid_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROJECT_ROW]),   # _get_project
        MagicMock(data=[]),                    # duplicate check
        MagicMock(data=[MOCK_BID_ROW]),        # insert bid
        MagicMock(data=[MOCK_BID_ROW]),        # bid stats: fetch bids
        MagicMock(data=[]),                    # bid stats: update project
    ]
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.post(f"/projects/{PROJECT_ID}/bids", json={
            "user_id": FREELANCER_ID,
            "amount": 450,
            "delivery_days": 7,
        })
    assert resp.status_code == 201
    assert resp.json()["id"] == BID_ID


def test_create_bid_project_not_open(client: TestClient):
    closed = {**MOCK_PROJECT_ROW, "status": "COMPLETED"}
    db = make_db([closed])
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.post(f"/projects/{PROJECT_ID}/bids", json={
            "user_id": FREELANCER_ID,
            "amount": 450,
            "delivery_days": 7,
        })
    assert resp.status_code == 400


def test_create_bid_conflict(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROJECT_ROW]),
        MagicMock(data=[MOCK_BID_ROW]),  # duplicate found
    ]
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.post(f"/projects/{PROJECT_ID}/bids", json={
            "user_id": FREELANCER_ID,
            "amount": 450,
            "delivery_days": 7,
        })
    assert resp.status_code == 409


def test_get_bid_success(client: TestClient):
    db = make_db([MOCK_BID_ROW])
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.get(f"/projects/{PROJECT_ID}/bids/{BID_ID}")
    assert resp.status_code == 200
    assert resp.json()["id"] == BID_ID


def test_get_bid_not_found(client: TestClient):
    db = make_db([])
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.get(f"/projects/{PROJECT_ID}/bids/{BID_ID}")
    assert resp.status_code == 404


def test_update_bid_status_success(client: TestClient):
    accepted = {**MOCK_BID_ROW, "status": "ACCEPTED"}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PROJECT_ROW]),  # _get_project (ownership)
        MagicMock(data=[MOCK_BID_ROW]),      # _get_bid
        MagicMock(data=[]),                   # update
        MagicMock(data=[accepted]),           # _get_bid (return fresh)
    ]
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.patch(
            f"/projects/{PROJECT_ID}/bids/{BID_ID}/status?user_id={CLIENT_ID}",
            json={"status": "ACCEPTED"},
        )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ACCEPTED"


def test_update_bid_status_not_owner(client: TestClient):
    db = make_db([MOCK_PROJECT_ROW])
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.patch(
            f"/projects/{PROJECT_ID}/bids/{BID_ID}/status?user_id=wrong-id",
            json={"status": "ACCEPTED"},
        )
    assert resp.status_code == 403


def test_withdraw_bid_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_BID_ROW]),  # _get_bid
        MagicMock(data=[]),               # delete
        MagicMock(data=[]),               # bid stats: fetch bids
        MagicMock(data=[]),               # bid stats: update project
    ]
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.delete(f"/projects/{PROJECT_ID}/bids/{BID_ID}?user_id={FREELANCER_ID}")
    assert resp.status_code == 204


def test_withdraw_bid_not_bidder(client: TestClient):
    db = make_db([MOCK_BID_ROW])
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.delete(f"/projects/{PROJECT_ID}/bids/{BID_ID}?user_id=wrong-id")
    assert resp.status_code == 403


def test_withdraw_bid_already_accepted(client: TestClient):
    accepted = {**MOCK_BID_ROW, "status": "ACCEPTED"}
    db = make_db([accepted])
    with patch("routers.bids.get_supabase", return_value=db):
        resp = client.delete(f"/projects/{PROJECT_ID}/bids/{BID_ID}?user_id={FREELANCER_ID}")
    assert resp.status_code == 400
