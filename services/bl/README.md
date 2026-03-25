# BL Service

Core business logic for the Freelancer MD platform.

## Overview

Handles all domain entities: users, profiles, skills, portfolio, projects, bids, invitations, reviews, bookmarks, and availability. Exposes a REST API consumed by the API gateway. No RabbitMQ events. Auth is handled externally — `user_id` is passed as a query parameter or request body field.

## Getting Started

### Prerequisites

- Python 3.12+
- Supabase project (cloud)

### Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port this service listens on | `8001` |
| `SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Supabase service role key | `eyJ...` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |

### Running Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env  # then edit .env

uvicorn main:app --reload --port 8001 
```

Docs available at: http://localhost:8001/docs

### Running with Docker Compose

```bash
# From the project root
docker compose up bl
```

## API Endpoints

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health check |

### Users

| Method | Path | Description |
|---|---|---|
| `POST` | `/users` | Create user (called by API gateway after registration) |
| `GET` | `/users/{user_id}` | Get user by ID |

### Uploads

Files are uploaded to Supabase Storage. Buckets must exist before use: `avatars`, `portfolio`, `documents`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/uploads/avatar/{user_id}` | Upload profile avatar (`multipart/form-data`, `?requester_id=`). Updates `profiles.avatar_url`. |
| `POST` | `/uploads/portfolio/{item_id}` | Upload portfolio image (`multipart/form-data`, `?user_id=`, optional `?sort_order=`). Inserts into `portfolio_images`. |
| `POST` | `/uploads/documents/{user_id}` | Upload document/PDF (`multipart/form-data`, `?requester_id=`). Returns public URL. |

**Allowed types:**
- Images (avatars, portfolio): `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Profiles

| Method | Path | Description |
|---|---|---|
| `POST` | `/profiles` | Create profile |
| `GET` | `/profiles/{user_id}` | Get profile by user ID |
| `PATCH` | `/profiles/{user_id}` | Update profile fields (`?requester_id=`) |

### Skills

| Method | Path | Description |
|---|---|---|
| `GET` | `/skills` | List all skills (optional `?q=` name search) |
| `POST` | `/skills` | Create skill |
| `GET` | `/skills/{skill_id}` | Get skill by ID |
| `GET` | `/skills/profile/{user_id}` | List a user's skills |
| `POST` | `/skills/profile` | Add skill to profile |
| `DELETE` | `/skills/profile` | Remove skill from profile (`?user_id=&skill_id=`) |

### Portfolio

| Method | Path | Description |
|---|---|---|
| `GET` | `/portfolio/{user_id}` | List portfolio items for user |
| `POST` | `/portfolio` | Create portfolio item |
| `PATCH` | `/portfolio/{item_id}` | Update item (`?user_id=`) |
| `DELETE` | `/portfolio/{item_id}` | Delete item (`?user_id=`) |
| `GET` | `/portfolio/{item_id}/images` | List images for item |
| `POST` | `/portfolio/{item_id}/images` | Add image to item (`?user_id=`) |
| `DELETE` | `/portfolio/{item_id}/images/{image_id}` | Remove image (`?user_id=`) |

### Availability

| Method | Path | Description |
|---|---|---|
| `GET` | `/availability/{user_id}` | Get calendar (optional `?from_date=&to_date=`) |
| `POST` | `/availability` | Upsert a day entry |
| `DELETE` | `/availability` | Remove a day entry (`?user_id=&date=`) |

### Categories

| Method | Path | Description |
|---|---|---|
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create category |
| `GET` | `/categories/{category_id}` | Get category by ID |

### Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/projects` | List projects with filters and pagination (`?user_plan=`) |
| `POST` | `/projects` | Create project (include `skill_ids` to attach required skills) |
| `GET` | `/projects/{project_id}` | Get project (`?user_plan=`) |
| `PATCH` | `/projects/{project_id}` | Update project (`?user_id=`) |
| `DELETE` | `/projects/{project_id}` | Delete project — OPEN only (`?user_id=`) |

> `avg_bid` is only populated in responses when `?user_plan=pro` or `?user_plan=premium`.

### Bids

| Method | Path | Description |
|---|---|---|
| `GET` | `/projects/{project_id}/bids` | List all bids on a project |
| `POST` | `/projects/{project_id}/bids` | Place a bid (project must be OPEN) |
| `GET` | `/projects/{project_id}/bids/{bid_id}` | Get bid by ID |
| `PATCH` | `/projects/{project_id}/bids/{bid_id}/status` | Accept or reject bid (`?user_id=` — project owner only) |
| `DELETE` | `/projects/{project_id}/bids/{bid_id}` | Withdraw bid (`?user_id=` — bidder only, PENDING only) |

> Bid create/delete recalculates `bid_count` and `avg_bid` on the project.

### Invitations

| Method | Path | Description |
|---|---|---|
| `GET` | `/invitations` | List invitations (`?user_id=`, optional `?role=client\|freelancer`) |
| `POST` | `/projects/{project_id}/invitations` | Send invitation to a freelancer |
| `PATCH` | `/invitations/{invitation_id}/respond` | Accept or decline (`?user_id=` — freelancer only, PENDING only) |

### Reviews

| Method | Path | Description |
|---|---|---|
| `GET` | `/reviews/{user_id}` | List reviews received by user (pagination: `?limit=&offset=`) |
| `POST` | `/projects/{project_id}/reviews` | Create review (score 1–5) |
| `GET` | `/projects/{project_id}/reviews` | List all reviews for a project |

> Review create recalculates `rating` and `review_count` on the target profile.

### Bookmarks

| Method | Path | Description |
|---|---|---|
| `GET` | `/bookmarks` | List bookmarked projects (`?user_id=`) |
| `POST` | `/bookmarks/{project_id}` | Bookmark a project (`?user_id=`) |
| `DELETE` | `/bookmarks/{project_id}` | Remove bookmark (`?user_id=`) |

## Events

This service does not publish or consume RabbitMQ events.

## Testing

```bash
source .venv/bin/activate
pytest tests/ -v
```

96 tests across 13 test files. All endpoints covered with happy path, 404, 409, 403, and 400 cases.

## Dependencies

| Package | Purpose |
|---|---|
| `fastapi` | Web framework |
| `uvicorn` | ASGI server |
| `supabase` | Supabase Python client |
| `pydantic` | Request/response validation |
| `python-dotenv` | Load environment variables from `.env` |
| `python-multipart` | Multipart form-data parsing for file uploads |
| `pytest` | Test runner |
