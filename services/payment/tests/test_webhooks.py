import json
from unittest.mock import AsyncMock, MagicMock, patch

import stripe

from helpers import USER_ID, CUSTOMER_ID, SUBSCRIPTION_ID, PRICE_PRO, MOCK_CUSTOMER_ROW, MOCK_SUB_ROW, MOCK_STRIPE_SUB, MOCK_INVOICE, make_db


def _make_event(event_type: str, obj: dict) -> dict:
    return {"type": event_type, "data": {"object": obj}}


def _post_webhook(client, db, event: dict):
    with patch("routers.webhooks.get_supabase", return_value=db), \
         patch("stripe.Webhook.construct_event", return_value=event):
        return client.post(
            "/webhooks/stripe",
            content=json.dumps(event).encode(),
            headers={"stripe-signature": "test_sig", "content-type": "application/json"},
        )


# ─── Signature verification ───────────────────────────────────────────────────

def test_invalid_signature_returns_400(client):
    with patch("stripe.Webhook.construct_event", side_effect=stripe.SignatureVerificationError("bad sig", "header")):
        resp = client.post(
            "/webhooks/stripe",
            content=b"{}",
            headers={"stripe-signature": "bad", "content-type": "application/json"},
        )
    assert resp.status_code == 400
    assert "Invalid Stripe signature" in resp.json()["detail"]


def test_invalid_payload_returns_400(client):
    with patch("stripe.Webhook.construct_event", side_effect=ValueError("bad json")):
        resp = client.post(
            "/webhooks/stripe",
            content=b"not json",
            headers={"stripe-signature": "sig", "content-type": "application/json"},
        )
    assert resp.status_code == 400


# ─── checkout.session.completed ──────────────────────────────────────────────

def test_checkout_completed_creates_subscription_record(client):
    session = {
        "id": "cs_test",
        "mode": "subscription",
        "subscription": SUBSCRIPTION_ID,
        "metadata": {"user_id": USER_ID, "plan": "pro"},
    }
    db = make_db()
    event = _make_event("checkout.session.completed", session)

    with patch("stripe.Subscription.retrieve_async", new=AsyncMock(return_value=MOCK_STRIPE_SUB)):
        resp = _post_webhook(client, db, event)

    assert resp.status_code == 200
    assert resp.json() == {"status": "success"}


def test_checkout_completed_missing_metadata_does_not_raise(client):
    session = {"id": "cs_test", "mode": "subscription", "metadata": {}}
    db = make_db()
    event = _make_event("checkout.session.completed", session)

    resp = _post_webhook(client, db, event)

    assert resp.status_code == 200


def test_checkout_completed_non_subscription_mode_is_ignored(client):
    session = {"id": "cs_test", "mode": "payment", "metadata": {}}
    db = make_db()
    event = _make_event("checkout.session.completed", session)

    resp = _post_webhook(client, db, event)

    assert resp.status_code == 200


# ─── customer.subscription.updated ───────────────────────────────────────────

def test_subscription_updated_syncs_plan_and_status(client):
    db = make_db()
    event = _make_event("customer.subscription.updated", MOCK_STRIPE_SUB)

    resp = _post_webhook(client, db, event)

    assert resp.status_code == 200
    db.table.return_value.update.assert_called()


# ─── customer.subscription.deleted ───────────────────────────────────────────

def test_subscription_deleted_reverts_to_basic(client):
    db = make_db()
    event = _make_event("customer.subscription.deleted", MOCK_STRIPE_SUB)

    resp = _post_webhook(client, db, event)

    assert resp.status_code == 200
    update_args = db.table.return_value.update.call_args[0][0]
    assert update_args["plan"] == "basic"
    assert update_args["status"] == "canceled"


# ─── invoice.paid ────────────────────────────────────────────────────────────

def test_invoice_paid_marks_subscription_active(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])
    event = _make_event("invoice.paid", MOCK_INVOICE)

    with patch("stripe.Subscription.retrieve_async", new=AsyncMock(return_value=MOCK_STRIPE_SUB)), \
         patch("routers.webhooks.publish_event", new=AsyncMock()):
        resp = _post_webhook(client, db, event)

    assert resp.status_code == 200
    update_args = db.table.return_value.update.call_args[0][0]
    assert update_args["status"] == "active"


def test_invoice_paid_publishes_payment_completed_event(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])
    event = _make_event("invoice.paid", MOCK_INVOICE)

    with patch("stripe.Subscription.retrieve_async", new=AsyncMock(return_value=MOCK_STRIPE_SUB)), \
         patch("routers.webhooks.publish_event", new=AsyncMock()) as mock_publish:
        _post_webhook(client, db, event)

    mock_publish.assert_called_once()
    payload = mock_publish.call_args[0][1]
    assert payload["email"] == MOCK_CUSTOMER_ROW["email"]
    assert payload["user_id"] == USER_ID


def test_invoice_paid_skips_publish_when_no_customer_found(client):
    db = make_db()  # empty: no customer row
    event = _make_event("invoice.paid", MOCK_INVOICE)

    with patch("stripe.Subscription.retrieve_async", new=AsyncMock(return_value=MOCK_STRIPE_SUB)), \
         patch("routers.webhooks.publish_event", new=AsyncMock()) as mock_publish:
        resp = _post_webhook(client, db, event)

    assert resp.status_code == 200
    mock_publish.assert_not_called()


def test_invoice_paid_without_subscription_id_is_ignored(client):
    invoice_no_sub = {**MOCK_INVOICE, "subscription": None}
    db = make_db()
    event = _make_event("invoice.paid", invoice_no_sub)

    with patch("routers.webhooks.publish_event", new=AsyncMock()):
        resp = _post_webhook(client, db, event)

    assert resp.status_code == 200


# ─── invoice.payment_failed ───────────────────────────────────────────────────

def test_invoice_payment_failed_marks_past_due(client):
    db = make_db()
    invoice = {"subscription": SUBSCRIPTION_ID}
    event = _make_event("invoice.payment_failed", invoice)

    resp = _post_webhook(client, db, event)

    assert resp.status_code == 200
    update_args = db.table.return_value.update.call_args[0][0]
    assert update_args["status"] == "past_due"
