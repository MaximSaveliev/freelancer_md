import logging
from datetime import datetime

import stripe
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

import config
from database import get_supabase
from models.schemas import InvoiceResponse, PortalSessionRequest, PortalSessionResponse

router = APIRouter(prefix="/billing", tags=["Billing"])
logger = logging.getLogger(__name__)


def _one(db, table: str, **filters) -> dict | None:
    q = db.table(table).select("*")
    for col, val in filters.items():
        q = q.eq(col, val)
    rows = q.limit(1).execute().data
    return rows[0] if rows else None


def _get_customer(db, user_id: str) -> dict:
    customer_row = _one(db, "stripe_customers", user_id=user_id)
    if not customer_row:
        raise HTTPException(status_code=404, detail="No billing account found for this user")
    return customer_row


@router.post("/portal", response_model=PortalSessionResponse)
async def create_portal_session(body: PortalSessionRequest):
    """
    Create a Stripe Customer Portal session.
    Returns a hosted URL where the user can manage payment methods,
    view invoices, and cancel their subscription.
    """
    db = get_supabase()
    customer_row = _get_customer(db, body.user_id)

    try:
        session = await stripe.billing_portal.Session.create_async(
            customer=customer_row["customer_id"],
            return_url=f"{config.BASE_URL}/dashboard",
        )
    except stripe.StripeError as e:
        logger.error(f"Stripe error creating portal session for user {body.user_id}: {e}")
        raise HTTPException(status_code=502, detail=str(e))

    return PortalSessionResponse(portal_url=session.url, session_id=session.id)


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices(user_id: str = Query(...), limit: int = Query(10, ge=1, le=100)):
    """List the user's Stripe invoices, most recent first."""
    db = get_supabase()
    customer_row = _get_customer(db, user_id)

    try:
        invoices = await stripe.Invoice.list_async(
            customer=customer_row["customer_id"],
            limit=limit,
        )
    except stripe.StripeError as e:
        logger.error(f"Stripe error listing invoices for user {user_id}: {e}")
        raise HTTPException(status_code=502, detail=str(e))

    return [
        InvoiceResponse(
            id=inv["id"],
            number=inv.get("number"),
            status=inv.get("status"),
            amount_paid=inv.get("amount_paid", 0),
            currency=inv.get("currency", "usd"),
            created=datetime.fromtimestamp(inv["created"]),
            invoice_pdf=inv.get("invoice_pdf"),
            hosted_invoice_url=inv.get("hosted_invoice_url"),
        )
        for inv in invoices.data
    ]


@router.get("/invoices/{invoice_id}/download")
async def download_invoice(invoice_id: str, user_id: str = Query(...)):
    """
    Redirect to the Stripe-hosted PDF for a specific invoice.
    Verifies that the invoice belongs to the requesting user before redirecting.
    """
    db = get_supabase()
    customer_row = _get_customer(db, user_id)

    try:
        invoice = await stripe.Invoice.retrieve_async(invoice_id)
    except stripe.StripeError as e:
        logger.error(f"Stripe error retrieving invoice {invoice_id} for user {user_id}: {e}")
        raise HTTPException(status_code=502, detail=str(e))

    if invoice.get("customer") != customer_row["customer_id"]:
        raise HTTPException(status_code=403, detail="Invoice does not belong to this user")

    pdf_url = invoice.get("invoice_pdf")
    if not pdf_url:
        raise HTTPException(status_code=404, detail="No PDF available for this invoice")

    return RedirectResponse(url=pdf_url)
