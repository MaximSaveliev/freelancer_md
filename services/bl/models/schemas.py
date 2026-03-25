from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, field_validator


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    CLIENT = "CLIENT"
    FREELANCER = "FREELANCER"
    ADMIN = "ADMIN"


class ProficiencyLevel(str, Enum):
    JUNIOR = "JUNIOR"
    MIDDLE = "MIDDLE"
    SENIOR = "SENIOR"


class PaymentType(str, Enum):
    FIXED = "FIXED"
    HOURLY = "HOURLY"
    AUCTION = "AUCTION"


class ProjectStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DISPUTED = "DISPUTED"
    CANCELLED = "CANCELLED"


class BidStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class InvitationStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"


# ─── Users ────────────────────────────────────────────────────────────────────

class UserCreateRequest(BaseModel):
    id: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    is_verified: bool = False


class UserResponse(BaseModel):
    id: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    is_verified: bool
    created_at: datetime
    updated_at: datetime


# ─── Profiles ─────────────────────────────────────────────────────────────────

class ProfileCreateRequest(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[ProficiencyLevel] = None
    hourly_rate: Optional[int] = None
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    founded_year: Optional[int] = None
    website_url: Optional[str] = None
    position: Optional[str] = None
    industry: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    grade: Optional[ProficiencyLevel] = None
    hourly_rate: Optional[int] = None
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    founded_year: Optional[int] = None
    website_url: Optional[str] = None
    position: Optional[str] = None
    industry: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    is_verified: bool
    rating: float
    review_count: int
    grade: Optional[ProficiencyLevel] = None
    hourly_rate: Optional[int] = None
    total_earned: int
    completed_count: int
    success_rate: float
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    founded_year: Optional[int] = None
    website_url: Optional[str] = None
    position: Optional[str] = None
    industry: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Skills ───────────────────────────────────────────────────────────────────

class SkillCreateRequest(BaseModel):
    name: str
    slug: str


class SkillResponse(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime
    updated_at: datetime


class ProfileSkillAddRequest(BaseModel):
    user_id: str
    skill_id: str
    proficiency: Optional[ProficiencyLevel] = None


class ProfileSkillResponse(BaseModel):
    user_id: str
    skill_id: str
    skill_name: Optional[str] = None
    proficiency: Optional[ProficiencyLevel] = None
    created_at: datetime
    updated_at: datetime


# ─── Portfolio ────────────────────────────────────────────────────────────────

class PortfolioItemCreateRequest(BaseModel):
    user_id: str
    title: str
    description: Optional[str] = None
    project_url: Optional[str] = None


class PortfolioItemUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    project_url: Optional[str] = None


class PortfolioItemResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    project_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class PortfolioImageAddRequest(BaseModel):
    url: str
    sort_order: int = 0


class PortfolioImageResponse(BaseModel):
    id: str
    portfolio_item_id: str
    url: str
    sort_order: int
    created_at: datetime


# ─── Availability ─────────────────────────────────────────────────────────────

class AvailabilitySetRequest(BaseModel):
    user_id: str
    date: date
    is_available: bool


class AvailabilityResponse(BaseModel):
    user_id: str
    date: date
    is_available: bool


# ─── Categories ───────────────────────────────────────────────────────────────

class CategoryCreateRequest(BaseModel):
    name: str
    slug: str
    parent_id: Optional[str] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    parent_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Projects ─────────────────────────────────────────────────────────────────

class ProjectCreateRequest(BaseModel):
    user_id: str
    category_id: Optional[str] = None
    title: str
    description: str
    payment_type: PaymentType
    budget: dict
    is_fixed_price: bool = True
    required_grade: Optional[ProficiencyLevel] = None
    deadline: Optional[datetime] = None
    is_urgent: bool = False
    skill_ids: list[str] = []


class ProjectUpdateRequest(BaseModel):
    category_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    payment_type: Optional[PaymentType] = None
    budget: Optional[dict] = None
    is_fixed_price: Optional[bool] = None
    required_grade: Optional[ProficiencyLevel] = None
    deadline: Optional[datetime] = None
    is_urgent: Optional[bool] = None
    status: Optional[ProjectStatus] = None


class ProjectResponse(BaseModel):
    id: str
    user_id: str
    category_id: Optional[str] = None
    title: str
    description: str
    payment_type: PaymentType
    budget: dict
    is_fixed_price: bool
    required_grade: Optional[ProficiencyLevel] = None
    deadline: Optional[datetime] = None
    is_urgent: bool
    status: ProjectStatus
    bid_count: int
    avg_bid: Optional[int] = None
    created_at: datetime
    updated_at: datetime


# ─── Bids ─────────────────────────────────────────────────────────────────────

class BidCreateRequest(BaseModel):
    user_id: str
    amount: int
    delivery_days: int
    cover_letter: Optional[str] = None


class BidUpdateStatusRequest(BaseModel):
    status: BidStatus


class BidResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    amount: int
    delivery_days: int
    cover_letter: Optional[str] = None
    status: BidStatus
    created_at: datetime
    updated_at: datetime


# ─── Invitations ──────────────────────────────────────────────────────────────

class InvitationCreateRequest(BaseModel):
    client_id: str
    freelancer_id: str
    message: Optional[str] = None


class InvitationRespondRequest(BaseModel):
    status: InvitationStatus

    @field_validator("status")
    @classmethod
    def must_not_be_pending(cls, v: InvitationStatus) -> InvitationStatus:
        if v == InvitationStatus.PENDING:
            raise ValueError("status must be ACCEPTED or DECLINED")
        return v


class InvitationResponse(BaseModel):
    id: str
    project_id: str
    client_id: str
    freelancer_id: str
    message: Optional[str] = None
    status: InvitationStatus
    created_at: datetime
    updated_at: datetime


# ─── Reviews ──────────────────────────────────────────────────────────────────

class ReviewCreateRequest(BaseModel):
    author_id: str
    target_id: str
    score: int
    text: Optional[str] = None

    @field_validator("score")
    @classmethod
    def score_in_range(cls, v: int) -> int:
        if v not in range(1, 6):
            raise ValueError("score must be between 1 and 5")
        return v


class ReviewResponse(BaseModel):
    id: str
    project_id: str
    author_id: str
    target_id: str
    score: int
    text: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Documents ────────────────────────────────────────────────────────────────

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    project_id: Optional[str] = None
    portfolio_item_id: Optional[str] = None
    filename: str
    url: str
    content_type: str
    created_at: datetime


# ─── Bookmarks ────────────────────────────────────────────────────────────────

class BookmarkResponse(BaseModel):
    user_id: str
    project_id: str
    created_at: datetime
