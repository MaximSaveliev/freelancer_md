from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from tests.helpers import (
    MOCK_PORTFOLIO_IMAGE_ROW,
    MOCK_PORTFOLIO_ITEM_ROW,
    PORTFOLIO_IMAGE_ID,
    PORTFOLIO_ITEM_ID,
    USER_ID,
    make_db,
)

OTHER_USER = "00000000-0000-0000-0000-000000000099"


def test_list_portfolio_items(client: TestClient):
    db = make_db([MOCK_PORTFOLIO_ITEM_ROW])
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.get(f"/portfolio/{USER_ID}")
    assert resp.status_code == 200
    assert resp.json()[0]["id"] == PORTFOLIO_ITEM_ID


def test_create_portfolio_item_success(client: TestClient):
    db = make_db([MOCK_PORTFOLIO_ITEM_ROW])
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.post("/portfolio", json={"user_id": USER_ID, "title": "My App"})
    assert resp.status_code == 201
    assert resp.json()["user_id"] == USER_ID


def test_update_portfolio_item_success(client: TestClient):
    updated = {**MOCK_PORTFOLIO_ITEM_ROW, "title": "Updated Title"}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PORTFOLIO_ITEM_ROW]),  # _get_item (ownership)
        MagicMock(data=[]),                          # update
        MagicMock(data=[updated]),                   # _get_item (return fresh)
    ]
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.patch(f"/portfolio/{PORTFOLIO_ITEM_ID}?user_id={USER_ID}", json={"title": "Updated Title"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"


def test_update_portfolio_item_wrong_owner(client: TestClient):
    db = make_db([MOCK_PORTFOLIO_ITEM_ROW])
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.patch(f"/portfolio/{PORTFOLIO_ITEM_ID}?user_id={OTHER_USER}", json={"title": "x"})
    assert resp.status_code == 403


def test_delete_portfolio_item_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PORTFOLIO_ITEM_ROW]),
        MagicMock(data=[]),
    ]
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.delete(f"/portfolio/{PORTFOLIO_ITEM_ID}?user_id={USER_ID}")
    assert resp.status_code == 204


def test_delete_portfolio_item_wrong_owner(client: TestClient):
    db = make_db([MOCK_PORTFOLIO_ITEM_ROW])
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.delete(f"/portfolio/{PORTFOLIO_ITEM_ID}?user_id={OTHER_USER}")
    assert resp.status_code == 403


def test_list_portfolio_images(client: TestClient):
    db = make_db([MOCK_PORTFOLIO_IMAGE_ROW])
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.get(f"/portfolio/{PORTFOLIO_ITEM_ID}/images")
    assert resp.status_code == 200
    assert resp.json()[0]["id"] == PORTFOLIO_IMAGE_ID


def test_add_portfolio_image_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PORTFOLIO_ITEM_ROW]),
        MagicMock(data=[MOCK_PORTFOLIO_IMAGE_ROW]),
    ]
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.post(
            f"/portfolio/{PORTFOLIO_ITEM_ID}/images?user_id={USER_ID}",
            json={"url": "https://example.com/img.jpg", "sort_order": 0},
        )
    assert resp.status_code == 201
    assert resp.json()["url"] == "https://example.com/img.jpg"


def test_add_portfolio_image_wrong_owner(client: TestClient):
    db = make_db([MOCK_PORTFOLIO_ITEM_ROW])
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.post(
            f"/portfolio/{PORTFOLIO_ITEM_ID}/images?user_id={OTHER_USER}",
            json={"url": "https://example.com/img.jpg"},
        )
    assert resp.status_code == 403


def test_delete_portfolio_image_success(client: TestClient):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_PORTFOLIO_ITEM_ROW]),
        MagicMock(data=[MOCK_PORTFOLIO_IMAGE_ROW]),
        MagicMock(data=[]),
    ]
    with patch("routers.portfolio.get_supabase", return_value=db):
        resp = client.delete(
            f"/portfolio/{PORTFOLIO_ITEM_ID}/images/{PORTFOLIO_IMAGE_ID}?user_id={USER_ID}"
        )
    assert resp.status_code == 204
