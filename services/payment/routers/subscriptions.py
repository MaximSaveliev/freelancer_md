from datetime import datetime
import logging

import stripe
from fastapi import APIRouter, HTTPException, Query

import config
from database import get_supabase
from models.schemas import CancelRequest, RefundRequest, SchedulePlanChangeRequest, SubscriptionResponse

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])
logger = logging.getLogger(__name__)


def _one(db, table: str, **filters) -> dict | None:
    q = db.table(table).select("*")
    for col, val in filters.items():
        q = q.eq(col, val)
    rows = q.limit(1).execute().data
    return rows[0] if rows else None

@router.get("/me", response_model=SubscriptionResponse)
async def get_my_subscription(user_id: str = Query(...)):
    """Get the current user's subscription. Returns basic plan if no paid subscription exists."""
    db = get_supabase()
    row = _one(db, "user_subscriptions", user_id=user_id)
    if not row:
        db.table("user_subscriptions").insert({"user_id": user_id, "plan": "basic", "status": "active"}).execute()
        row = _one(db, "user_subscriptions", user_id=user_id)
    return SubscriptionResponse(**row)


@router.post("/schedule-change", response_model=SubscriptionResponse)
async def schedule_plan_change(body: SchedulePlanChangeRequest):
    """
    Schedule a plan upgrade or downgrade for the next billing cycle.
    The current plan stays active until the period ends, then the new plan kicks in.
    """
    db = get_supabase()
    sub = _one(db, "user_subscriptions", user_id=body.user_id)
    if not sub or not sub.get("subscription_id"):
        raise HTTPException(status_code=404, detail="No active subscription found")

    if sub["plan"] == body.new_plan:
        raise HTTPException(status_code=400, detail=f"Already on the '{body.new_plan}' plan")

    if sub.get("cancel_at_period_end"):
        raise HTTPException(
            status_code=400,
            detail="Cannot schedule a plan change on a subscription that is set to cancel. "
                   "Reactivate first.",
        )

    new_price_id = config.get_price_id(body.new_plan)
    if not new_price_id:
        raise HTTPException(
            status_code=400,
            detail=f"No price configured for plan '{body.new_plan}'",
        )

    try:
        subscription = await stripe.Subscription.retrieve_async(sub["subscription_id"])
        schedule = await stripe.SubscriptionSchedule.create_async(
            from_subscription=sub["subscription_id"]
        )
        await stripe.SubscriptionSchedule.modify_async(
            schedule.id,
            end_behavior="release",
            phases=[
                {
                    "items": [{"price": subscription["items"]["data"][0]["price"]["id"], "quantity": subscription["items"]["data"][0].get("quantity", 1)}],
                    "start_date": subscription["items"]["data"][0]["current_period_start"],
                    "end_date": subscription["items"]["data"][0]["current_period_end"],
                },
                {
                    "items": [{"price": new_price_id, "quantity": 1}],
                    "duration": {"interval": "month", "interval_count": 1}
                },
            ],
        )
    except stripe.StripeError as e:
        logger.error(f"Stripe error scheduling plan change for user {body.user_id}: {e}")
        raise HTTPException(status_code=502, detail=str(e))

    db.table("user_subscriptions").update({
        "scheduled_plan": body.new_plan,
        "schedule_id": schedule.id,
    }).eq("user_id", body.user_id).execute()

    updated = _one(db, "user_subscriptions", user_id=body.user_id)
    return SubscriptionResponse(**updated)


@router.post("/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(body: CancelRequest):
    """
    Cancel at the end of the current billing period.
    The user keeps access until the period ends.
    Any pending scheduled plan change is also cancelled.
    """
    db = get_supabase()
    sub = _one(db, "user_subscriptions", user_id=body.user_id)
    if not sub or sub.get("status") not in ("active", "canceling"):
        raise HTTPException(status_code=404, detail="No active subscription found")

    try:
        schedule_id = sub.get("schedule_id")
        if schedule_id:
            await stripe.SubscriptionSchedule.release_async(schedule_id)
            logger.info(f"Released subscription schedule {schedule_id} for subscription {sub['subscription_id']}")

        await stripe.Subscription.modify_async(
            sub["subscription_id"],
            cancel_at_period_end=True,
            metadata={"cancelled_by": body.user_id, "cancelled_at": str(datetime.now())}
        )
    except stripe.StripeError as e:
        logger.error(f"Stripe error canceling subscription for user {body.user_id}: {e}")
        raise HTTPException(status_code=502, detail=str(e))

    db.table("user_subscriptions").update({
        "status": "canceling",
        "cancel_at_period_end": True,
        "scheduled_plan": None,
        "schedule_id": None,
    }).eq("user_id", body.user_id).execute()

    updated = _one(db, "user_subscriptions", user_id=body.user_id)
    return SubscriptionResponse(**updated)


@router.post("/refund", response_model=SubscriptionResponse)
async def refund_and_cancel(body: RefundRequest):
    """
    Refund the most recent invoice and cancel the subscription immediately.
    The user loses access right away and is reverted to the basic plan.
    """
    logger.info(f"Refund requested by user {body.user_id}. Reason: {body.reason}")

    db = get_supabase()
    sub = _one(db, "user_subscriptions", user_id=body.user_id)
    if not sub or sub.get("status") not in ("active", "canceling"):
        raise HTTPException(status_code=404, detail="No active subscription found")

    try:
        subscription = await stripe.Subscription.retrieve_async(
            sub["subscription_id"],
            expand=["latest_invoice"],
        )

        schedule_id = sub.get("schedule_id")
        if schedule_id:
            await stripe.SubscriptionSchedule.release_async(schedule_id)
            logger.info(f"Released subscription schedule {schedule_id} for subscription {sub['subscription_id']}")

        invoice = await stripe.Invoice.retrieve_async(subscription["latest_invoice"]["id"], expand=["payments"])
        payments = invoice["payments"]["data"][0]
        if invoice and invoice["status"] == "paid" and payments["payment"]["payment_intent"]:
            await stripe.Refund.create_async(
                payment_intent=payments["payment"]["payment_intent"],
                amount=payments["amount_paid"],
                reason="requested_by_customer",
                metadata={
                    "user_id": body.user_id,
                    "subscription_id": sub["subscription_id"],
                    "invoice_id": invoice["id"],
                    "reason": body.reason,
                    "refunded_at": datetime.now().isoformat(),
                },
            )
        else:
            raise HTTPException(status_code=400, detail="No eligible charge found to refund")

        await stripe.Subscription.cancel_async(sub["subscription_id"])
    except stripe.StripeError as e:
        logger.error(f"Stripe error refunding subscription for user {body.user_id}: {e}")
        raise HTTPException(status_code=502, detail=str(e))

    db.table("user_subscriptions").update({
        "status": "active",
        "plan": "basic",
        "cancel_at_period_end": False,
        "scheduled_plan": None,
        "schedule_id": None,
    }).eq("user_id", body.user_id).execute()

    return SubscriptionResponse(user_id=body.user_id, plan="basic", status="canceled")
