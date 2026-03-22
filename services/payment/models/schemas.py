from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


# ─── Checkout ─────────────────────────────────────────────────────────────────

class SubscriptionCheckoutRequest(BaseModel):
    user_id: str
    plan: Literal["pro", "premium"]
    email: str
    name: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


# ─── Subscriptions ────────────────────────────────────────────────────────────

class SchedulePlanChangeRequest(BaseModel):
    user_id: str
    new_plan: Literal["pro", "premium"]


class CancelRequest(BaseModel):
    user_id: str


class RefundRequest(BaseModel):
    user_id: str
    reason: str = "Refund requested"


class PortalSessionRequest(BaseModel):
    user_id: str


class PortalSessionResponse(BaseModel):
    portal_url: str
    session_id: str


# ─── Billing / Invoices ───────────────────────────────────────────────────────

class InvoiceResponse(BaseModel):
    id: str
    number: Optional[str] = None
    status: Optional[str] = None
    amount_paid: int           # in cents
    currency: str
    created: datetime
    invoice_pdf: Optional[str] = None
    hosted_invoice_url: Optional[str] = None


class SubscriptionResponse(BaseModel):
    user_id: str
    plan: Literal["basic", "pro", "premium"]
    status: str = "active"
    subscription_id: Optional[str] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    scheduled_plan: Optional[Literal["pro", "premium"]] = None
    schedule_id: Optional[str] = None
