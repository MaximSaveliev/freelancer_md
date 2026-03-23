import logging

import stripe
from fastapi import APIRouter, HTTPException

import config
from database import get_supabase
from models.schemas import CheckoutResponse, SubscriptionCheckoutRequest

router = APIRouter(prefix="/checkout", tags=["Checkout"])
logger = logging.getLogger(__name__)

PLAN_LABELS = {
    "pro": "Pro Plan",
    "premium": "Premium Plan",
}


@router.post("/subscriptions", response_model=CheckoutResponse)
async def create_subscription_checkout(body: SubscriptionCheckoutRequest):
    """
    Create a Stripe Checkout session for a Pro or Premium subscription.
    Uses the USD base price; Stripe Adaptive Pricing converts to the customer's local currency.
    Returns a hosted Stripe URL — redirect the user here to complete payment.
    """
    price_id = config.get_price_id(body.plan)
    if not price_id:
        raise HTTPException(
            status_code=400,
            detail=f"No price configured for plan '{body.plan}'",
        )

    db = get_supabase()

    existing_sub = (
        db.table("user_subscriptions")
        .select("status, plan")
        .eq("user_id", body.user_id)
        .limit(1)
        .execute()
    )
    if existing_sub.data and existing_sub.data[0]["status"] in ("active", "canceling", "past_due") and existing_sub.data[0]["plan"] != "basic":
        raise HTTPException(
            status_code=400,
            detail="You already have an active subscription. Cancel or wait for it to expire before subscribing again.",
        )

    customer_id = await _get_or_create_customer(body.user_id, body.email, body.name, db)

    try:
        session = await stripe.checkout.Session.create_async(
            customer=customer_id,
            payment_method_types=["card", "paypal"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=(
                f"{config.BASE_URL}/dashboard/subscription/success"
                "?session_id={CHECKOUT_SESSION_ID}"
            ),
            cancel_url=f"{config.BASE_URL}/dashboard/subscription/cancel",
            allow_promotion_codes=True,
            subscription_data={
                "description": PLAN_LABELS[body.plan],
                "metadata": {"user_id": body.user_id, "plan": body.plan},
            },
            metadata={"user_id": body.user_id, "plan": body.plan},
        )
    except stripe.StripeError as e:
        logger.error(f"Stripe error creating checkout for user {body.user_id}: {e}")
        raise HTTPException(status_code=502, detail=str(e))

    return CheckoutResponse(checkout_url=session.url, session_id=session.id)


async def _get_or_create_customer(user_id: str, email: str, name: str, db) -> str:
    """Return existing Stripe customer ID, updating email/name if changed, or create a new one."""
    result = (
        db.table("stripe_customers")
        .select("customer_id, email, name")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if result.data:
        customer = result.data[0]
        customer_id = customer["customer_id"]
        if customer.get("email") != email or customer.get("name") != name:
            await stripe.Customer.modify_async(customer_id, email=email, name=name)
            db.table("stripe_customers").update({"email": email, "name": name}).eq("user_id", user_id).execute()
        return customer_id

    customer = await stripe.Customer.create_async(
        email=email,
        name=name,
        metadata={"user_id": user_id},
    )

    db.table("stripe_customers").insert({
        "user_id": user_id,
        "customer_id": customer.id,
        "email": email,
        "name": name,
    }).execute()

    return customer.id
