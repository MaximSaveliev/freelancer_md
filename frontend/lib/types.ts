// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';
export type ProficiencyLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR';
export type PaymentType = 'FIXED' | 'HOURLY' | 'AUCTION';
export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type SubscriptionPlan = 'basic' | 'pro' | 'premium';

// ─── BL Entities ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  is_verified: boolean;
  rating: number;
  review_count: number;
  grade: ProficiencyLevel | null;
  hourly_rate: number | null;
  total_earned: number;
  completed_count: number;
  success_rate: number;
  company_name: string | null;
  company_size: string | null;
  founded_year: number | null;
  website_url: string | null;
  position: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileSkill {
  user_id: string;
  skill_id: string;
  skill_name: string | null;
  proficiency: ProficiencyLevel | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectBudget {
  amount?: number;
  min?: number;
  max?: number;
}

export interface Project {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string;
  payment_type: PaymentType;
  budget: ProjectBudget;
  is_fixed_price: boolean;
  required_grade: ProficiencyLevel | null;
  deadline: string | null;
  is_urgent: boolean;
  status: ProjectStatus;
  bid_count: number;
  avg_bid: number | null;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  delivery_days: number;
  cover_letter: string | null;
  status: BidStatus;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  project_id: string;
  author_id: string;
  target_id: string;
  score: number;
  text: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  project_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioImage {
  id: string;
  portfolio_item_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  project_id: string | null;
  portfolio_item_id: string | null;
  filename: string;
  url: string;
  content_type: string;
  created_at: string;
}

// ─── Request Shapes ───────────────────────────────────────────────────────────

export interface UserCreateRequest {
  id: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface ProfileCreateRequest {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  grade?: ProficiencyLevel;
  hourly_rate?: number;
  company_name?: string;
  company_size?: string;
  founded_year?: number;
  website_url?: string;
  position?: string;
  industry?: string;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  grade?: ProficiencyLevel;
  hourly_rate?: number;
  company_name?: string;
  company_size?: string;
  founded_year?: number;
  industry?: string;
  position?: string;
  website_url?: string;
}

export interface BidCreateRequest {
  user_id: string;
  amount: number;
  delivery_days: number;
  cover_letter?: string;
}

export interface PortfolioItemCreateRequest {
  user_id: string;
  title: string;
  description?: string;
  project_url?: string;
}

export interface PortfolioItemUpdateRequest {
  title?: string;
  description?: string;
  project_url?: string;
}

// ─── Payment Entities ─────────────────────────────────────────────────────────

export interface SubscriptionResponse {
  user_id: string;
  plan: SubscriptionPlan;
  status: string;
  subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  scheduled_plan: string | null;
  schedule_id: string | null;
}

export interface InvoiceResponse {
  id: string;
  number: string | null;
  status: string;
  amount_paid: number;
  currency: string;
  created: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface PortalSessionResponse {
  portal_url: string;
  session_id: string;
}

export interface SubscriptionCheckoutRequest {
  user_id: string;
  plan: 'pro' | 'premium';
  email: string;
  name: string;
}
