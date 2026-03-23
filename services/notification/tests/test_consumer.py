import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

from consumer import (
    _invoice_email_html,
    _handle_payment_completed,
    _make_message_handler,
    HANDLERS,
)

PAYMENT_PAYLOAD = {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "email": "user@example.com",
    "name": "Test User",
    "plan": "pro",
    "amount": 999,
    "currency": "usd",
    "invoice_id": "in_test123",
    "invoice_number": "INV-001",
    "invoice_pdf": "https://invoice.stripe.com/test.pdf",
}


def _run(coro):
    return asyncio.run(coro)


# ─── _invoice_email_html ──────────────────────────────────────────────────────

def test_email_html_contains_name_and_plan():
    html = _invoice_email_html("John", "pro", 999, "usd", None, None)
    assert "John" in html
    assert "Pro" in html


def test_email_html_formats_amount_correctly():
    html = _invoice_email_html("John", "pro", 999, "usd", None, None)
    assert "9.99 USD" in html


def test_email_html_includes_invoice_number():
    html = _invoice_email_html("John", "pro", 999, "usd", "INV-001", None)
    assert "INV-001" in html


def test_email_html_includes_pdf_button_when_present():
    html = _invoice_email_html("John", "pro", 999, "usd", None, "https://invoice.pdf")
    assert "https://invoice.pdf" in html
    assert "Download Invoice PDF" in html


def test_email_html_no_pdf_button_when_absent():
    html = _invoice_email_html("John", "pro", 999, "usd", None, None)
    assert "Download Invoice PDF" not in html


# ─── _handle_payment_completed ────────────────────────────────────────────────

def test_handle_payment_completed_sends_email():
    with patch("resend.Emails.send") as mock_send:
        _run(_handle_payment_completed(PAYMENT_PAYLOAD))

    mock_send.assert_called_once()
    params = mock_send.call_args[0][0]
    assert params["to"] == ["user@example.com"]
    assert "pro" in params["subject"].lower()


def test_handle_payment_completed_uses_test_email_override():
    with patch("consumer.config") as mock_config, \
         patch("resend.Emails.send") as mock_send:
        mock_config.RESEND_API_KEY = "re_test"
        mock_config.SENDER_EMAIL = "from@example.com"
        mock_config.RESEND_TEST_EMAIL = "override@example.com"

        _run(_handle_payment_completed(PAYMENT_PAYLOAD))

    params = mock_send.call_args[0][0]
    assert params["to"] == ["override@example.com"]


def test_handle_payment_completed_handles_send_error_without_raising():
    with patch("resend.Emails.send", side_effect=Exception("Resend down")):
        # Should not raise
        _run(_handle_payment_completed(PAYMENT_PAYLOAD))


# ─── _make_message_handler ────────────────────────────────────────────────────

def test_message_handler_calls_correct_handler():
    called_with = {}

    async def fake_handler(payload):
        called_with.update(payload)

    message = MagicMock()
    message.body = json.dumps(PAYMENT_PAYLOAD).encode()
    message.process = MagicMock(return_value=AsyncMock(
        __aenter__=AsyncMock(return_value=None),
        __aexit__=AsyncMock(return_value=False),
    ))

    handler = _make_message_handler("payment.completed", fake_handler)
    _run(handler(message))

    assert called_with["email"] == PAYMENT_PAYLOAD["email"]


def test_message_handler_handles_invalid_json_without_raising():
    message = MagicMock()
    message.body = b"not valid json"
    message.process = MagicMock(return_value=AsyncMock(
        __aenter__=AsyncMock(return_value=None),
        __aexit__=AsyncMock(return_value=False),
    ))

    handler = _make_message_handler("payment.completed", AsyncMock())
    # Should not raise
    _run(handler(message))


# ─── HANDLERS registry ────────────────────────────────────────────────────────

def test_handlers_registry_contains_payment_completed():
    assert "payment.completed" in HANDLERS
    assert callable(HANDLERS["payment.completed"])
