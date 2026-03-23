import datetime
import logging

import stripe
from fastapi import APIRouter, HTTPException, Request

import config
from database import get_supabase
from publisher import publish_event

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
logger = logging.getLogger(__name__)

PRICE_TO_PLAN = {
    config.STRIPE_PRO_PRICE_ID: "pro",
    config.STRIPE_PREMIUM_PRICE_ID: "premium",
}


def _period_iso(ts: int) -> str:
    return datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc).isoformat()


def _get_period(subscription) -> int | None:
    items = subscription.get("items")
    if items:
        data = items.get("data")
        if data:
            return (data[0].get("current_period_start"), data[0].get("current_period_end"))
    return (None, None)


def _one(db, table: str, **filters) -> dict | None:
    q = db.table(table).select("*")
    for col, val in filters.items():
        q = q.eq(col, val)
    result = q.limit(1).execute()
    return result.data[0] if result.data else None


async def _on_checkout_completed(session, db) -> None:
    if session.get("mode") != "subscription":
        return

    metadata = session.get("metadata") or {}
    user_id = metadata.get("user_id")
    plan = metadata.get("plan")
    subscription_id = session.get("subscription")

    if not user_id or not plan or not subscription_id:
        logger.warning(f"checkout.session.completed missing metadata: {session.get('id')}")
        return

    subscription = await stripe.Subscription.retrieve_async(subscription_id)
    period_start, period_end = _get_period(subscription)

    record = {
        "user_id": user_id,
        "subscription_id": subscription_id,
        "plan": plan,
        "status": subscription.get("status"),
        "cancel_at_period_end": False,
        "current_period_start": _period_iso(period_start) if period_start else None,
        "current_period_end": _period_iso(period_end) if period_end else None,
    }

    existing = _one(db, "user_subscriptions", user_id=user_id)
    if existing:
        db.table("user_subscriptions").update(record).eq("user_id", user_id).execute()
    else:
        db.table("user_subscriptions").insert(record).execute()

    logger.info(f"Subscription record saved: user={user_id} plan={plan}")


async def _on_subscription_updated(subscription, db) -> None:
    price_id = subscription["items"]["data"][0]["price"]["id"]
    plan = PRICE_TO_PLAN.get(price_id, "basic")
    period_start, period_end = _get_period(subscription)

    update = {
        "plan": plan,
        "status": subscription.get("status"),
        "cancel_at_period_end": subscription.get("cancel_at_period_end", False),
        "current_period_start": _period_iso(period_start) if period_start else None,
        "current_period_end": _period_iso(period_end) if period_end else None,
    }

    if subscription.get("schedule") is None:
        update["scheduled_plan"] = None
        update["schedule_id"] = None

    db.table("user_subscriptions").update(update).eq("subscription_id", subscription["id"]).execute()
    logger.info(f"Subscription updated: {subscription['id']} → {plan}")


async def _on_subscription_deleted(subscription, db) -> None:
    db.table("user_subscriptions").update({
        "status": "canceled",
        "plan": "basic",
        "cancel_at_period_end": False,
        "scheduled_plan": None,
        "schedule_id": None,
    }).eq("subscription_id", subscription["id"]).execute()
    logger.info(f"Subscription canceled: {subscription['id']}")


async def _on_invoice_paid(invoice, db) -> None:
    subscription_id = invoice.get("subscription")
    if not subscription_id:
        return

    subscription = await stripe.Subscription.retrieve_async(subscription_id)
    period_start, period_end = _get_period(subscription)

    db.table("user_subscriptions").update({
        "status": "active",
        "current_period_start": _period_iso(period_start) if period_start else None,
        "current_period_end": _period_iso(period_end) if period_end else None,
    }).eq("subscription_id", subscription_id).execute()
    logger.info(f"Invoice paid, subscription active: {subscription_id}")


async def _publish_payment_completed(invoice, db) -> None:
    customer_row = _one(db, "stripe_customers", customer_id=invoice.get("customer"))
    if not customer_row:
        logger.warning(f"No customer found for invoice {invoice.get('id')} — skipping notification")
        return

    lines = invoice.get("lines", {}).get("data", [])
    price_id = lines[0]["pricing"]["price_details"]["price"] if lines else None
    plan = PRICE_TO_PLAN.get(price_id, "")

    await publish_event("payment.completed", {
        "user_id": customer_row["user_id"],
        "email": customer_row["email"],
        "name": customer_row["name"],
        "plan": plan,
        "amount": invoice.get("amount_paid", 0),
        "currency": invoice.get("currency", "usd"),
        "invoice_id": invoice.get("id"),
        "invoice_number": invoice.get("number"),
        "invoice_pdf": invoice.get("invoice_pdf"),
    })


async def _on_invoice_payment_failed(invoice, db) -> None:
    subscription_id = invoice.get("subscription")
    if not subscription_id:
        return

    db.table("user_subscriptions").update({
        "status": "past_due",
    }).eq("subscription_id", subscription_id).execute()
    logger.warning(f"Payment failed for subscription: {subscription_id}")


@router.post("/stripe")
async def handle_stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, config.STRIPE_WEBHOOK_SECRET
        )
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")

    event_type = event["type"]
    obj = event["data"]["object"]
    db = get_supabase()

    logger.info(f"Stripe webhook: {event_type}")

    if event_type == "checkout.session.completed":
        await _on_checkout_completed(obj, db)

    elif event_type == "customer.subscription.updated":
        await _on_subscription_updated(obj, db)

    elif event_type == "customer.subscription.deleted":
        await _on_subscription_deleted(obj, db)

    elif event_type == "invoice.paid":
        await _on_invoice_paid(obj, db)
        await _publish_payment_completed(obj, db)

    elif event_type == "invoice.payment_failed":
        await _on_invoice_payment_failed(obj, db)

    return {"status": "success"}
