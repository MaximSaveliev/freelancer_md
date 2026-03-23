# Notification Service

Listens to RabbitMQ events from other services and dispatches Telegram messages and in-app notifications to users.

## Overview

This service is event-driven — it does not accept requests from the frontend directly. It subscribes to exchanges on RabbitMQ and reacts to events published by auth, messenger, and payment services by sending Telegram bot messages and storing in-app notification records in Supabase.

## Getting Started

### Prerequisites

- Python 3.12+
- Telegram Bot token (create via [@BotFather](https://t.me/BotFather))
- Running RabbitMQ (via Docker Compose)

### Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port this service listens on | `8003` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | `123456:ABC-DEF...` |
| `RABBITMQ_URL` | RabbitMQ connection string | `amqp://guest:guest@rabbitmq:5672/` |

### Running Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env  # then edit .env

uvicorn main:app --host 0.0.0.0 --port 8003 --reload
```

Docs available at: http://localhost:8003/docs

### Running with Docker Compose

```bash
# From the project root
docker compose up notification
```

## API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Service health check | No |

All notification logic is triggered by RabbitMQ events, not HTTP calls.

## Events

### Consumed

| Exchange | Routing key | Action |
|---|---|---|
| `messenger` | `message.sent` | Telegram alert to recipient |
| `jobs` | `proposal.received` | Telegram alert to client |
| `jobs` | `proposal.accepted` | Telegram alert to freelancer |
| `payment` | `payment.completed` | Telegram payment confirmation |
| `payment` | `subscription.expiring` | Telegram reminder to user |

## Testing

```bash
source .venv/bin/activate
pytest tests/
```

| Test | What it covers |
|---|---|
| `test_health_check` | `GET /health` returns `200` with correct payload |

## Dependencies

| Package | Purpose |
|---|---|
| `fastapi` | Web framework (health endpoint + admin hooks) |
| `uvicorn` | ASGI server |
| `aio-pika` | Async RabbitMQ consumer |
| `python-telegram-bot` | Telegram Bot API client |
| `python-dotenv` | Load environment variables from `.env` |
