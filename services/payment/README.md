# Payment Service

Stripe subscription management for Freelancer MD.

## Overview

Handles three subscription tiers — Basic (free, default for all users), Pro ($9.99/mo), and Premium ($19.99/mo). Uses Stripe hosted Checkout for payment collection and Stripe webhooks to keep the database in sync. On successful payment, publishes a `payment.completed` event to RabbitMQ so the notification service can send an invoice email.

Key features:
- Subscription checkout via Stripe hosted page (Checkout Sessions)
- Customer billing portal — manage payment methods, view invoices, cancel subscription
- Invoice listing and PDF download
- Scheduled plan upgrades/downgrades (take effect at next billing cycle via `SubscriptionSchedule`)
- Cancel at period end, or refund + cancel immediately
- Webhook handler for the full Stripe subscription lifecycle
- RabbitMQ publisher — emits `payment.completed` on every successful invoice payment

## Getting Started

### Prerequisites

- Python 3.12+
- Stripe account (test mode) with products and prices created in the Dashboard
- Supabase project with the required tables (see below)
- RabbitMQ running locally or via Docker Compose

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Service port | `8004` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from `stripe listen` | `whsec_...` |
| `STRIPE_PRO_PRICE_ID_USD` | Stripe Price ID for the Pro plan | `price_...` |
| `STRIPE_PREMIUM_PRICE_ID_USD` | Stripe Price ID for the Premium plan | `price_...` |
| `BASE_URL` | Frontend base URL for Stripe redirect URLs | `http://localhost:3000` |
| `SUPABASE_URL` | Supabase project URL | `https://<project>.supabase.co` |
| `SUPABASE_KEY` | Supabase service role key | `eyJ...` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://guest:guest@localhost:5672/` |

Copy `.env.example` to `.env` and fill in all values.

### Running Locally

```bash
cd services/payment
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8004
```

### Running with Docker

```bash
docker compose up payment
```

### Local Stripe Webhooks

Forward Stripe events to the local service:

```bash
stripe listen --forward-to localhost:8004/webhooks/stripe
```

## API Endpoints

### Health & Plans

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `GET` | `/plans` | — | List all plans with prices and Stripe price IDs |

### Checkout

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/checkout/subscriptions` | — | Create a Stripe Checkout session for Pro or Premium |

**POST /checkout/subscriptions**

Request:
```json
{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "plan": "pro",
  "email": "user@example.com",
  "name": "John Doe"
}
```

Response:
```json
{
  "checkout_url": "https://checkout.stripe.com/pay/...",
  "session_id": "cs_..."
}
```

Redirect the user to `checkout_url`. On success, Stripe redirects to `BASE_URL/dashboard/subscription/success`.

---

### Subscriptions

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/subscriptions/me` | — | Get current subscription (creates basic if none) |
| `POST` | `/subscriptions/schedule-change` | — | Schedule plan upgrade/downgrade at next cycle |
| `POST` | `/subscriptions/cancel` | — | Cancel at period end |
| `POST` | `/subscriptions/refund` | — | Refund latest invoice and cancel immediately |

**GET /subscriptions/me**

Query params: `user_id` (required)

Response:
```json
{
  "user_id": "...",
  "plan": "pro",
  "status": "active",
  "subscription_id": "sub_...",
  "current_period_end": "2024-12-15T00:00:00Z",
  "cancel_at_period_end": false,
  "scheduled_plan": null,
  "schedule_id": null
}
```

If the user has no subscription record, a Basic plan record is created automatically.

**POST /subscriptions/schedule-change**

Schedules a plan change for the next billing cycle. The current plan stays active until the period ends.

Request:
```json
{
  "user_id": "...",
  "new_plan": "premium"
}
```

Returns 400 if the user is already on that plan, or if the subscription is set to cancel.

**POST /subscriptions/cancel**

Cancels at the end of the current billing period. Any pending scheduled plan change is also released.

Request:
```json
{ "user_id": "..." }
```

**POST /subscriptions/refund**

Refunds the most recent invoice and cancels the subscription immediately. The user is reverted to the Basic plan.

Request:
```json
{
  "user_id": "...",
  "reason": "Not satisfied"
}
```

---

### Billing

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/billing/portal` | — | Create a Stripe Customer Portal session |
| `GET` | `/billing/invoices` | — | List the user's invoices |
| `GET` | `/billing/invoices/{invoice_id}/download` | — | Redirect to invoice PDF |

**POST /billing/portal**

Opens Stripe's hosted Customer Portal where the user can manage payment methods, view billing history, and cancel their subscription.

Request:
```json
{ "user_id": "..." }
```

Response:
```json
{
  "portal_url": "https://billing.stripe.com/session/...",
  "session_id": "bps_..."
}
```

Redirect the user to `portal_url`.

**GET /billing/invoices**

Query params: `user_id` (required), `limit` (optional, 1–100, default 10)

Response: array of invoice objects:
```json
[
  {
    "id": "in_...",
    "number": "INV-0001",
    "status": "paid",
    "amount_paid": 999,
    "currency": "usd",
    "created": "2024-11-15T00:00:00",
    "invoice_pdf": "https://...",
    "hosted_invoice_url": "https://..."
  }
]
```

**GET /billing/invoices/{invoice_id}/download**

Query params: `user_id` (required)

Verifies the invoice belongs to the requesting user, then redirects (307) to the Stripe-hosted PDF URL. Returns 403 if the invoice belongs to a different customer.

---

### Webhooks

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/webhooks/stripe` | Stripe signature | Handle Stripe lifecycle events |

Stripe must send requests with a valid `Stripe-Signature` header. Events handled:

| Stripe Event | Action |
|---|---|
| `checkout.session.completed` | Create or update subscription DB record |
| `customer.subscription.updated` | Sync plan, status, period end, schedule |
| `customer.subscription.deleted` | Revert user to Basic plan |
| `invoice.paid` | Mark subscription active, update period end, publish `payment.completed` to RabbitMQ |
| `invoice.payment_failed` | Mark subscription as `past_due` |

## RabbitMQ Events

| Queue | Published when | Payload |
|---|---|---|
| `payment.completed` | `invoice.paid` webhook received | `user_id`, `email`, `name`, `plan`, `amount`, `currency`, `invoice_id`, `invoice_number`, `invoice_pdf` |

## Supabase Tables

```sql
CREATE TABLE stripe_customers (
    user_id     UUID PRIMARY KEY,
    customer_id TEXT NOT NULL UNIQUE,
    email       TEXT,
    name        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL UNIQUE,
    subscription_id      TEXT,
    plan                 TEXT NOT NULL DEFAULT 'basic',
    status               TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    scheduled_plan       TEXT,
    schedule_id          TEXT,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

```bash
cd services/payment
source .venv/bin/activate
pytest tests/ -v
```

Tests are fully isolated — no real Stripe or Supabase connections are made. All external calls are mocked.

| File | What is tested |
|---|---|
| `test_health.py` | `/health` and `/plans` endpoints |
| `test_checkout.py` | Checkout session creation, customer reuse, blocking active subs, Stripe errors |
| `test_subscriptions.py` | Get/create subscription, schedule change, cancel, refund |
| `test_billing.py` | Portal session, invoice list, invoice PDF download + ownership check |
| `test_webhooks.py` | All webhook event handlers, `payment.completed` publish logic |
| `test_publisher.py` | RabbitMQ publish function — success and error handling |

## Dependencies

| Package | Purpose |
|---|---|
| `fastapi` | HTTP framework |
| `uvicorn` | ASGI server |
| `stripe` | Stripe SDK — async methods throughout |
| `supabase` | Supabase database client |
| `aio-pika` | Async RabbitMQ client for publishing events |
| `python-dotenv` | Load `.env` variables |
| `pytest` | Test runner |
| `pytest-asyncio` | Async test support |
| `httpx` | HTTP client used by FastAPI TestClient |
