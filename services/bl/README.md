# Auth Service

Handles user registration, login, JWT token issuance/refresh, and email verification via Resend.

## Overview

This service owns all identity and access management for the platform. It stores user records in Supabase, issues signed JWT tokens, and sends verification emails through Resend. On successful registration or login it publishes a RabbitMQ event so other services (e.g. notification) can react.

## Getting Started

### Prerequisites

- Python 3.12+
- Supabase project (cloud)
- Resend account and API key
- Running RabbitMQ and Redis (via Docker Compose)

### Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port this service listens on | `8001` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Supabase service role key | `eyJ...` |
| `JWT_SECRET` | Secret used to sign JWT tokens | `change-me-strong-secret` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Access token TTL in minutes | `30` |
| `RESEND_API_KEY` | Resend API key for sending emails | `re_...` |
| `EMAIL_FROM` | Sender address for verification emails | `no-reply@yourdomain.com` |
| `REDIS_URL` | Redis Cloud connection string (token blocklist) | `redis://default:pass@host.redis.cloud:6379` |

### Running Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env  # then edit .env

uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Docs available at: http://localhost:8001/docs

### Running with Docker Compose

```bash
# From the project root
docker compose up auth
```

## API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Service health check | No |
| `POST` | `/register` | Register a new user | No |
| `POST` | `/login` | Login and receive JWT tokens | No |
| `POST` | `/logout` | Invalidate the current token | Bearer JWT |
| `POST` | `/refresh` | Refresh access token | Refresh token |
| `POST` | `/verify-email` | Confirm email with token from email link | No |
| `POST` | `/resend-verification` | Re-send the verification email | No |
| `GET` | `/me` | Return current user profile | Bearer JWT |

> Endpoints marked _coming soon_ are planned for the next iteration.

## Events

This service does not publish RabbitMQ events. Email verification on registration is handled directly via Resend — no broker needed.

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
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `python-jose` | JWT creation and verification |
| `passlib[bcrypt]` | Password hashing |
| `supabase` | Supabase Python client |
| `resend` | Transactional email via Resend |
| `redis` | Token blocklist (logout) |
| `python-dotenv` | Load environment variables from `.env` |
