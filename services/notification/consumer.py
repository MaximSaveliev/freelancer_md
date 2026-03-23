import asyncio
import json
import logging

import aio_pika
import resend

import config

logger = logging.getLogger(__name__)


def _invoice_email_html(name: str, plan: str, amount: int, currency: str, invoice_number: str | None, invoice_pdf: str | None) -> str:
    amount_str = f"{amount / 100:.2f} {currency.upper()}"
    pdf_button = (
        f'<p><a href="{invoice_pdf}" style="background:#000;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Download Invoice PDF</a></p>'
        if invoice_pdf else ""
    )
    invoice_line = f"<p>Invoice number: <strong>{invoice_number}</strong></p>" if invoice_number else ""

    return f"""
    <div style="font-family:sans-serif;max-width:520px;margin:auto;">
        <h2>Payment Confirmed ✓</h2>
        <p>Hi {name},</p>
        <p>Your payment of <strong>{amount_str}</strong> for the <strong>{plan.capitalize()}</strong> plan has been received.</p>
        {invoice_line}
        {pdf_button}
        <p style="margin-top:32px;color:#666;">Thank you for using Freelancer MD!</p>
    </div>
    """


async def _handle_payment_completed(payload: dict) -> None:
    resend.api_key = config.RESEND_API_KEY

    recipient = config.RESEND_TEST_EMAIL or payload["email"]

    params: resend.Emails.SendParams = {
        "from": config.SENDER_EMAIL,
        "to": [recipient],
        "subject": f"Payment confirmed — {payload.get('plan', '').capitalize()} plan",
        "html": _invoice_email_html(
            name=payload.get("name", ""),
            plan=payload.get("plan", ""),
            amount=payload.get("amount", 0),
            currency=payload.get("currency", "usd"),
            invoice_number=payload.get("invoice_number"),
            invoice_pdf=payload.get("invoice_pdf"),
        ),
    }

    try:
        resend.Emails.send(params)
        logger.info(f"Invoice email sent to {payload['email']}")
    except Exception as e:
        logger.error(f"Failed to send invoice email to {payload['email']}: {e}")


HANDLERS: dict[str, callable] = {
    "payment.completed": _handle_payment_completed,
}


def _make_message_handler(queue_name: str, handler):
    async def _on_message(message: aio_pika.IncomingMessage) -> None:
        async with message.process():
            try:
                payload = json.loads(message.body)
                await handler(payload)
            except Exception as e:
                logger.error(f"Error processing message from '{queue_name}': {e}")
    return _on_message


async def start_consumer() -> None:
    connection = await aio_pika.connect_robust(config.RABBITMQ_URL)
    channel = await connection.channel()
    await channel.set_qos(prefetch_count=1)

    for queue_name, handler in HANDLERS.items():
        queue = await channel.declare_queue(queue_name, durable=True)
        await queue.consume(_make_message_handler(queue_name, handler))

    logger.info(f"RabbitMQ consumer started on: {list(HANDLERS.keys())}")
    await asyncio.Future()  # keep running until cancelled
