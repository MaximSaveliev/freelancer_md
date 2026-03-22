import logging

import stripe
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

import config

stripe.api_key = config.STRIPE_SECRET_KEY

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from routers import billing, checkout, subscriptions, webhooks

app = FastAPI(
    title="Payment Service",
    description="Stripe subscription/payments management for Freelancer MD.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(billing.router)
app.include_router(checkout.router)
app.include_router(subscriptions.router)
app.include_router(webhooks.router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "payment"}


@app.get("/plans", tags=["Plans"])
async def get_plans():
    """Return available subscription plans with prices and Stripe price IDs."""
    return {
        "plans": [
            {
                "id": "basic",
                "name": "Basic",
                "price_usd": 0,
                "price_eur": 0,
                "price_id_usd": None,
                "price_id_eur": None,
            },
            {
                "id": "pro",
                "name": "Pro",
                "price_usd": 9.99,
                "price_id": config.STRIPE_PRO_PRICE_ID,
            },
            {
                "id": "premium",
                "name": "Premium",
                "price_usd": 19.99,
                "price_id": config.STRIPE_PREMIUM_PRICE_ID,
            },
        ]
    }
