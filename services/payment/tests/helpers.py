from unittest.mock import MagicMock

USER_ID = "00000000-0000-0000-0000-000000000001"
CUSTOMER_ID = "cus_test123"
SUBSCRIPTION_ID = "sub_test123"
PRICE_PRO = "price_pro_test"
PRICE_PREMIUM = "price_premium_test"

MOCK_CUSTOMER_ROW = {
    "user_id": USER_ID,
    "customer_id": CUSTOMER_ID,
    "email": "test@example.com",
    "name": "Test User",
}

MOCK_SUB_ROW = {
    "user_id": USER_ID,
    "plan": "pro",
    "status": "active",
    "subscription_id": SUBSCRIPTION_ID,
    "cancel_at_period_end": False,
    "scheduled_plan": None,
    "schedule_id": None,
    "current_period_end": None,
}

MOCK_STRIPE_SUB = {
    "id": SUBSCRIPTION_ID,
    "status": "active",
    "cancel_at_period_end": False,
    "schedule": None,
    "items": {
        "data": [{
            "price": {"id": PRICE_PRO},
            "current_period_start": 1700000000,
            "current_period_end": 1702592000,
            "quantity": 1,
        }]
    },
}

MOCK_INVOICE = {
    "id": "in_test123",
    "subscription": SUBSCRIPTION_ID,
    "customer": CUSTOMER_ID,
    "status": "paid",
    "amount_paid": 999,
    "currency": "usd",
    "number": "INV-001",
    "invoice_pdf": "https://invoice.stripe.com/test.pdf",
    "hosted_invoice_url": "https://invoice.stripe.com/test",
    "created": 1700000000,
    "lines": {
        "data": [{
            "pricing": {
                "price_details": {
                    "price": PRICE_PRO,
                }
            }
        }]
    },
    "payments": {
        "data": [{
            "payment": {"payment_intent": "pi_test123"},
            "amount_paid": 999,
        }]
    },
}


def make_db(data=None):
    """
    Return a mock Supabase client where all execute() calls return `data`.
    For tests needing different responses per call, configure
    db.table.return_value.execute.side_effect = [...] directly.
    """
    db = MagicMock()
    q = MagicMock()
    q.select.return_value = q
    q.eq.return_value = q
    q.limit.return_value = q
    q.insert.return_value = q
    q.update.return_value = q
    q.execute.return_value = MagicMock(data=data or [])
    db.table.return_value = q
    return db
