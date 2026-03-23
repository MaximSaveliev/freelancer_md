import os

from dotenv import load_dotenv

load_dotenv()

# ─── Service ──────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")
BASE_URL: str = os.getenv("BASE_URL", "http://localhost:3000")

# ─── Stripe ───────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Price IDs are created in the Stripe Dashboard.
STRIPE_PRO_PRICE_ID: str = os.getenv("STRIPE_PRO_PRICE_ID_USD", "")
STRIPE_PREMIUM_PRICE_ID: str = os.getenv("STRIPE_PREMIUM_PRICE_ID_USD", "")

# ─── Database ─────────────────────────────────────────────────────────────────
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

# ─── Messaging ────────────────────────────────────────────────────────────────
RABBITMQ_URL: str = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost/")


PRICE_IDS: dict[str, str] = {
    "pro": STRIPE_PRO_PRICE_ID,
    "premium": STRIPE_PREMIUM_PRICE_ID,
}


def get_price_id(plan: str) -> str:
    return PRICE_IDS.get(plan, "")
