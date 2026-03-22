from unittest.mock import AsyncMock, MagicMock, patch

from helpers import USER_ID, SUBSCRIPTION_ID, MOCK_SUB_ROW, MOCK_STRIPE_SUB, MOCK_INVOICE, make_db


# ─── GET /subscriptions/me ───────────────────────────────────────────────────

def test_get_my_subscription_returns_existing(client):
    db = make_db(data=[MOCK_SUB_ROW])

    with patch("routers.subscriptions.get_supabase", return_value=db):
        resp = client.get(f"/subscriptions/me?user_id={USER_ID}")

    assert resp.status_code == 200
    assert resp.json()["plan"] == "pro"
    assert resp.json()["user_id"] == USER_ID


def test_get_my_subscription_creates_basic_when_none(client):
    basic_row = {**MOCK_SUB_ROW, "plan": "basic", "subscription_id": None}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[]),           # first _one: no subscription
        MagicMock(data=[]),           # insert basic
        MagicMock(data=[basic_row]),  # second _one: newly created row
    ]

    with patch("routers.subscriptions.get_supabase", return_value=db):
        resp = client.get(f"/subscriptions/me?user_id={USER_ID}")

    assert resp.status_code == 200
    assert resp.json()["plan"] == "basic"


# ─── POST /subscriptions/schedule-change ─────────────────────────────────────

def test_schedule_plan_change_success(client):
    updated_row = {**MOCK_SUB_ROW, "scheduled_plan": "premium", "schedule_id": "sched_test"}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_SUB_ROW]),   # _one: current sub
        MagicMock(data=[]),               # update
        MagicMock(data=[updated_row]),    # _one: updated sub
    ]
    mock_schedule = MagicMock(id="sched_test")

    with patch("routers.subscriptions.get_supabase", return_value=db), \
         patch("stripe.Subscription.retrieve_async", new=AsyncMock(return_value=MOCK_STRIPE_SUB)), \
         patch("stripe.SubscriptionSchedule.create_async", new=AsyncMock(return_value=mock_schedule)), \
         patch("stripe.SubscriptionSchedule.modify_async", new=AsyncMock()):
        resp = client.post("/subscriptions/schedule-change", json={
            "user_id": USER_ID,
            "new_plan": "premium",
        })

    assert resp.status_code == 200
    assert resp.json()["scheduled_plan"] == "premium"


def test_schedule_plan_change_no_subscription_returns_404(client):
    db = make_db()

    with patch("routers.subscriptions.get_supabase", return_value=db):
        resp = client.post("/subscriptions/schedule-change", json={
            "user_id": USER_ID,
            "new_plan": "premium",
        })

    assert resp.status_code == 404


def test_schedule_plan_change_same_plan_returns_400(client):
    db = make_db(data=[MOCK_SUB_ROW])  # current plan is "pro"

    with patch("routers.subscriptions.get_supabase", return_value=db):
        resp = client.post("/subscriptions/schedule-change", json={
            "user_id": USER_ID,
            "new_plan": "pro",
        })

    assert resp.status_code == 400
    assert "Already on the 'pro' plan" in resp.json()["detail"]


def test_schedule_plan_change_blocked_when_canceling(client):
    canceling_row = {**MOCK_SUB_ROW, "cancel_at_period_end": True}
    db = make_db(data=[canceling_row])

    with patch("routers.subscriptions.get_supabase", return_value=db):
        resp = client.post("/subscriptions/schedule-change", json={
            "user_id": USER_ID,
            "new_plan": "premium",
        })

    assert resp.status_code == 400
    assert "Reactivate first" in resp.json()["detail"]


# ─── POST /subscriptions/cancel ──────────────────────────────────────────────

def test_cancel_subscription_success(client):
    updated_row = {**MOCK_SUB_ROW, "status": "canceling", "cancel_at_period_end": True}
    db = make_db()
    q = db.table.return_value
    q.execute.side_effect = [
        MagicMock(data=[MOCK_SUB_ROW]),   # _one: current sub
        MagicMock(data=[]),               # update DB
        MagicMock(data=[updated_row]),    # _one: updated sub
    ]

    with patch("routers.subscriptions.get_supabase", return_value=db), \
         patch("stripe.Subscription.modify_async", new=AsyncMock()):
        resp = client.post("/subscriptions/cancel", json={"user_id": USER_ID})

    assert resp.status_code == 200
    assert resp.json()["cancel_at_period_end"] is True
    assert resp.json()["status"] == "canceling"


def test_cancel_subscription_not_found_returns_404(client):
    db = make_db()

    with patch("routers.subscriptions.get_supabase", return_value=db):
        resp = client.post("/subscriptions/cancel", json={"user_id": USER_ID})

    assert resp.status_code == 404


# ─── POST /subscriptions/refund ──────────────────────────────────────────────

def test_refund_and_cancel_success(client):
    mock_stripe_sub = {**MOCK_STRIPE_SUB, "latest_invoice": {"id": "in_test123"}}
    db = make_db(data=[MOCK_SUB_ROW])

    with patch("routers.subscriptions.get_supabase", return_value=db), \
         patch("stripe.Subscription.retrieve_async", new=AsyncMock(return_value=mock_stripe_sub)), \
         patch("stripe.Invoice.retrieve_async", new=AsyncMock(return_value=MOCK_INVOICE)), \
         patch("stripe.Refund.create_async", new=AsyncMock()), \
         patch("stripe.Subscription.cancel_async", new=AsyncMock()):
        resp = client.post("/subscriptions/refund", json={
            "user_id": USER_ID,
            "reason": "Changed my mind",
        })

    assert resp.status_code == 200
    assert resp.json()["plan"] == "basic"


def test_refund_no_subscription_returns_404(client):
    db = make_db()

    with patch("routers.subscriptions.get_supabase", return_value=db):
        resp = client.post("/subscriptions/refund", json={
            "user_id": USER_ID,
            "reason": "Test",
        })

    assert resp.status_code == 404
