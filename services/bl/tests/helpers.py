from unittest.mock import MagicMock

USER_ID = "00000000-0000-0000-0000-000000000001"
CLIENT_ID = "00000000-0000-0000-0000-000000000002"
FREELANCER_ID = "00000000-0000-0000-0000-000000000003"
PROJECT_ID = "00000000-0000-0000-0000-000000000010"
BID_ID = "00000000-0000-0000-0000-000000000020"
SKILL_ID = "00000000-0000-0000-0000-000000000030"
PORTFOLIO_ITEM_ID = "00000000-0000-0000-0000-000000000040"
PORTFOLIO_IMAGE_ID = "00000000-0000-0000-0000-000000000041"
CATEGORY_ID = "00000000-0000-0000-0000-000000000050"
INVITATION_ID = "00000000-0000-0000-0000-000000000060"
REVIEW_ID = "00000000-0000-0000-0000-000000000070"

NOW = "2026-03-25T00:00:00+00:00"

MOCK_USER_ROW = {
    "id": USER_ID,
    "email": "test@example.com",
    "phone": None,
    "role": "FREELANCER",
    "is_verified": False,
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_PROFILE_ROW = {
    "id": "00000000-0000-0000-0000-000000000099",
    "user_id": USER_ID,
    "first_name": "Test",
    "last_name": "User",
    "avatar_url": None,
    "bio": None,
    "location": None,
    "is_verified": False,
    "rating": 0.0,
    "review_count": 0,
    "grade": "JUNIOR",
    "hourly_rate": None,
    "total_earned": 0,
    "completed_count": 0,
    "success_rate": 0.0,
    "company_name": None,
    "company_size": None,
    "founded_year": None,
    "website_url": None,
    "position": None,
    "industry": None,
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_SKILL_ROW = {
    "id": SKILL_ID,
    "name": "Python",
    "slug": "python",
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_CATEGORY_ROW = {
    "id": CATEGORY_ID,
    "name": "Web Development",
    "slug": "web-development",
    "parent_id": None,
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_PROJECT_ROW = {
    "id": PROJECT_ID,
    "user_id": CLIENT_ID,
    "category_id": None,
    "title": "Build a website",
    "description": "A great project",
    "payment_type": "FIXED",
    "budget": {"amount": 500},
    "is_fixed_price": True,
    "required_grade": None,
    "deadline": None,
    "is_urgent": False,
    "status": "OPEN",
    "bid_count": 0,
    "avg_bid": None,
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_BID_ROW = {
    "id": BID_ID,
    "project_id": PROJECT_ID,
    "user_id": FREELANCER_ID,
    "amount": 450,
    "delivery_days": 7,
    "cover_letter": "I can do this",
    "status": "PENDING",
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_INVITATION_ROW = {
    "id": INVITATION_ID,
    "project_id": PROJECT_ID,
    "client_id": CLIENT_ID,
    "freelancer_id": FREELANCER_ID,
    "message": "Please join",
    "status": "PENDING",
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_REVIEW_ROW = {
    "id": REVIEW_ID,
    "project_id": PROJECT_ID,
    "author_id": CLIENT_ID,
    "target_id": FREELANCER_ID,
    "score": 5,
    "text": "Great work",
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_PORTFOLIO_ITEM_ROW = {
    "id": PORTFOLIO_ITEM_ID,
    "user_id": USER_ID,
    "title": "My App",
    "description": "A cool app",
    "project_url": None,
    "created_at": NOW,
    "updated_at": NOW,
}

MOCK_PORTFOLIO_IMAGE_ROW = {
    "id": PORTFOLIO_IMAGE_ID,
    "portfolio_item_id": PORTFOLIO_ITEM_ID,
    "url": "https://example.com/img.jpg",
    "sort_order": 0,
    "created_at": NOW,
}


def make_db(data=None):
    db = MagicMock()
    q = MagicMock()
    for method in [
        "select", "eq", "neq", "gte", "lte", "ilike", "in_",
        "limit", "offset", "order", "insert", "update", "delete", "upsert",
    ]:
        getattr(q, method).return_value = q
    q.execute.return_value = MagicMock(data=data or [])
    db.table.return_value = q
    return db
