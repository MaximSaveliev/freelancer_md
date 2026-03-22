from unittest.mock import AsyncMock, MagicMock, patch

from helpers import USER_ID, CUSTOMER_ID, MOCK_CUSTOMER_ROW, make_db


def test_checkout_creates_session_for_new_customer(client):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),   # user_subscriptions: no active sub
        MagicMock(data=[]),   # stripe_customers: no existing customer
        MagicMock(data=[]),   # insert customer
    ]
    mock_session = MagicMock(url="https://checkout.stripe.com/pay/test", id="cs_test")

    with patch("routers.checkout.get_supabase", return_value=db), \
         patch("stripe.Customer.create_async", new=AsyncMock(return_value=MagicMock(id=CUSTOMER_ID))), \
         patch("stripe.checkout.Session.create_async", new=AsyncMock(return_value=mock_session)):
        resp = client.post("/checkout/subscriptions", json={
            "user_id": USER_ID,
            "plan": "pro",
            "email": "test@example.com",
            "name": "Test User",
        })

    assert resp.status_code == 200
    assert resp.json()["checkout_url"] == "https://checkout.stripe.com/pay/test"
    assert resp.json()["session_id"] == "cs_test"


def test_checkout_reuses_existing_stripe_customer(client):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),                   # user_subscriptions: no active sub
        MagicMock(data=[MOCK_CUSTOMER_ROW]),  # stripe_customers: existing customer
    ]
    mock_session = MagicMock(url="https://checkout.stripe.com/pay/test", id="cs_test")

    with patch("routers.checkout.get_supabase", return_value=db), \
         patch("stripe.checkout.Session.create_async", new=AsyncMock(return_value=mock_session)):
        resp = client.post("/checkout/subscriptions", json={
            "user_id": USER_ID,
            "plan": "pro",
            "email": "test@example.com",
            "name": "Test User",
        })

    assert resp.status_code == 200


def test_checkout_blocked_when_active_subscription_exists(client):
    db = make_db(data=[{"status": "active", "plan": "pro"}])

    with patch("routers.checkout.get_supabase", return_value=db):
        resp = client.post("/checkout/subscriptions", json={
            "user_id": USER_ID,
            "plan": "premium",
            "email": "test@example.com",
            "name": "Test User",
        })

    assert resp.status_code == 400
    assert "already have an active subscription" in resp.json()["detail"]


def test_checkout_allowed_when_on_basic_plan(client):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[{"status": "active", "plan": "basic"}]),  # basic plan → not blocked
        MagicMock(data=[MOCK_CUSTOMER_ROW]),
    ]
    mock_session = MagicMock(url="https://checkout.stripe.com/pay/test", id="cs_test")

    with patch("routers.checkout.get_supabase", return_value=db), \
         patch("stripe.checkout.Session.create_async", new=AsyncMock(return_value=mock_session)):
        resp = client.post("/checkout/subscriptions", json={
            "user_id": USER_ID,
            "plan": "pro",
            "email": "test@example.com",
            "name": "Test User",
        })

    assert resp.status_code == 200


def test_checkout_rejects_invalid_plan(client):
    resp = client.post("/checkout/subscriptions", json={
        "user_id": USER_ID,
        "plan": "gold",
        "email": "test@example.com",
        "name": "Test User",
    })
    assert resp.status_code == 422


def test_checkout_stripe_error_returns_502(client):
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),
        MagicMock(data=[MOCK_CUSTOMER_ROW]),
    ]

    import stripe
    with patch("routers.checkout.get_supabase", return_value=db), \
         patch("stripe.checkout.Session.create_async", new=AsyncMock(side_effect=stripe.StripeError("Stripe down"))):
        resp = client.post("/checkout/subscriptions", json={
            "user_id": USER_ID,
            "plan": "pro",
            "email": "test@example.com",
            "name": "Test User",
        })

    assert resp.status_code == 502
