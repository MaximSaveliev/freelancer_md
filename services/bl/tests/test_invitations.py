from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import (
    CLIENT_ID,
    FREELANCER_ID,
    INVITATION_ID,
    MOCK_INVITATION_ROW,
    PROJECT_ID,
    make_db,
)


def test_list_invitations_as_freelancer(client: TestClient):
    db = make_db([MOCK_INVITATION_ROW])
    with patch("routers.invitations.get_supabase", return_value=db):
        resp = client.get(f"/invitations?user_id={FREELANCER_ID}&role=freelancer")
    assert resp.status_code == 200
    assert resp.json()[0]["id"] == INVITATION_ID


def test_list_invitations_as_client(client: TestClient):
    db = make_db([MOCK_INVITATION_ROW])
    with patch("routers.invitations.get_supabase", return_value=db):
        resp = client.get(f"/invitations?user_id={CLIENT_ID}&role=client")
    assert resp.status_code == 200


def test_send_invitation_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),
        MagicMock(data=[MOCK_INVITATION_ROW]),
    ]
    with patch("routers.invitations.get_supabase", return_value=db):
        resp = client.post(f"/projects/{PROJECT_ID}/invitations", json={
            "client_id": CLIENT_ID,
            "freelancer_id": FREELANCER_ID,
            "message": "Please join",
        })
    assert resp.status_code == 201
    assert resp.json()["id"] == INVITATION_ID


def test_send_invitation_conflict(client: TestClient):
    db = make_db([MOCK_INVITATION_ROW])
    with patch("routers.invitations.get_supabase", return_value=db):
        resp = client.post(f"/projects/{PROJECT_ID}/invitations", json={
            "client_id": CLIENT_ID,
            "freelancer_id": FREELANCER_ID,
        })
    assert resp.status_code == 409


def test_respond_invitation_accept(client: TestClient):
    accepted = {**MOCK_INVITATION_ROW, "status": "ACCEPTED"}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_INVITATION_ROW]),
        MagicMock(data=[]),
        MagicMock(data=[accepted]),
    ]
    with patch("routers.invitations.get_supabase", return_value=db):
        resp = client.patch(
            f"/invitations/{INVITATION_ID}/respond?user_id={FREELANCER_ID}",
            json={"status": "ACCEPTED"},
        )
    assert resp.status_code == 200
    assert resp.json()["status"] == "ACCEPTED"


def test_respond_invitation_decline(client: TestClient):
    declined = {**MOCK_INVITATION_ROW, "status": "DECLINED"}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_INVITATION_ROW]),
        MagicMock(data=[]),
        MagicMock(data=[declined]),
    ]
    with patch("routers.invitations.get_supabase", return_value=db):
        resp = client.patch(
            f"/invitations/{INVITATION_ID}/respond?user_id={FREELANCER_ID}",
            json={"status": "DECLINED"},
        )
    assert resp.status_code == 200
    assert resp.json()["status"] == "DECLINED"


def test_respond_invitation_not_freelancer(client: TestClient):
    db = make_db([MOCK_INVITATION_ROW])
    with patch("routers.invitations.get_supabase", return_value=db):
        resp = client.patch(
            f"/invitations/{INVITATION_ID}/respond?user_id=wrong-id",
            json={"status": "ACCEPTED"},
        )
    assert resp.status_code == 403


def test_respond_invitation_not_pending(client: TestClient):
    accepted = {**MOCK_INVITATION_ROW, "status": "ACCEPTED"}
    db = make_db([accepted])
    with patch("routers.invitations.get_supabase", return_value=db):
        resp = client.patch(
            f"/invitations/{INVITATION_ID}/respond?user_id={FREELANCER_ID}",
            json={"status": "DECLINED"},
        )
    assert resp.status_code == 400
