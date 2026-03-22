from unittest.mock import AsyncMock, MagicMock, patch

from helpers import USER_ID, CUSTOMER_ID, MOCK_CUSTOMER_ROW, MOCK_INVOICE, make_db


# ─── POST /billing/portal ────────────────────────────────────────────────────

def test_create_portal_session_success(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])
    mock_session = MagicMock(url="https://billing.stripe.com/session/test", id="bps_test")

    with patch("routers.billing.get_supabase", return_value=db), \
         patch("stripe.billing_portal.Session.create_async", new=AsyncMock(return_value=mock_session)):
        resp = client.post("/billing/portal", json={"user_id": USER_ID})

    assert resp.status_code == 200
    assert resp.json()["portal_url"] == "https://billing.stripe.com/session/test"
    assert resp.json()["session_id"] == "bps_test"


def test_create_portal_session_no_customer_returns_404(client):
    db = make_db()

    with patch("routers.billing.get_supabase", return_value=db):
        resp = client.post("/billing/portal", json={"user_id": USER_ID})

    assert resp.status_code == 404


def test_create_portal_session_stripe_error_returns_502(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])

    import stripe
    with patch("routers.billing.get_supabase", return_value=db), \
         patch("stripe.billing_portal.Session.create_async", new=AsyncMock(side_effect=stripe.StripeError("Stripe error"))):
        resp = client.post("/billing/portal", json={"user_id": USER_ID})

    assert resp.status_code == 502


# ─── GET /billing/invoices ───────────────────────────────────────────────────

def test_list_invoices_success(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])
    mock_invoices = MagicMock(data=[MOCK_INVOICE])

    with patch("routers.billing.get_supabase", return_value=db), \
         patch("stripe.Invoice.list_async", new=AsyncMock(return_value=mock_invoices)):
        resp = client.get(f"/billing/invoices?user_id={USER_ID}")

    assert resp.status_code == 200
    invoices = resp.json()
    assert len(invoices) == 1
    assert invoices[0]["id"] == "in_test123"
    assert invoices[0]["amount_paid"] == 999
    assert invoices[0]["currency"] == "usd"


def test_list_invoices_empty(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])
    mock_invoices = MagicMock(data=[])

    with patch("routers.billing.get_supabase", return_value=db), \
         patch("stripe.Invoice.list_async", new=AsyncMock(return_value=mock_invoices)):
        resp = client.get(f"/billing/invoices?user_id={USER_ID}")

    assert resp.status_code == 200
    assert resp.json() == []


def test_list_invoices_no_customer_returns_404(client):
    db = make_db()

    with patch("routers.billing.get_supabase", return_value=db):
        resp = client.get(f"/billing/invoices?user_id={USER_ID}")

    assert resp.status_code == 404


def test_list_invoices_limit_param(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])
    mock_invoices = MagicMock(data=[])

    with patch("routers.billing.get_supabase", return_value=db), \
         patch("stripe.Invoice.list_async", new=AsyncMock(return_value=mock_invoices)) as mock_list:
        client.get(f"/billing/invoices?user_id={USER_ID}&limit=25")

    mock_list.assert_called_once_with(customer=CUSTOMER_ID, limit=25)


# ─── GET /billing/invoices/{id}/download ─────────────────────────────────────

def test_download_invoice_redirects_to_pdf(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])

    with patch("routers.billing.get_supabase", return_value=db), \
         patch("stripe.Invoice.retrieve_async", new=AsyncMock(return_value=MOCK_INVOICE)):
        resp = client.get(
            f"/billing/invoices/in_test123/download?user_id={USER_ID}",
            follow_redirects=False,
        )

    assert resp.status_code in (302, 307)
    assert resp.headers["location"] == MOCK_INVOICE["invoice_pdf"]


def test_download_invoice_no_customer_returns_404(client):
    db = make_db()

    with patch("routers.billing.get_supabase", return_value=db):
        resp = client.get(f"/billing/invoices/in_test123/download?user_id={USER_ID}")

    assert resp.status_code == 404


def test_download_invoice_wrong_owner_returns_403(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])
    other_invoice = {**MOCK_INVOICE, "customer": "cus_other"}

    with patch("routers.billing.get_supabase", return_value=db), \
         patch("stripe.Invoice.retrieve_async", new=AsyncMock(return_value=other_invoice)):
        resp = client.get(f"/billing/invoices/in_test123/download?user_id={USER_ID}")

    assert resp.status_code == 403


def test_download_invoice_no_pdf_returns_404(client):
    db = make_db(data=[MOCK_CUSTOMER_ROW])
    invoice_without_pdf = {**MOCK_INVOICE, "invoice_pdf": None}

    with patch("routers.billing.get_supabase", return_value=db), \
         patch("stripe.Invoice.retrieve_async", new=AsyncMock(return_value=invoice_without_pdf)):
        resp = client.get(f"/billing/invoices/in_test123/download?user_id={USER_ID}")

    assert resp.status_code == 404
