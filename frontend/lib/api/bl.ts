import { apiFetch } from './client';
import type {
  User, Profile, Skill, ProfileSkill, Category,
  Project, Bid, Review, PortfolioItem, PortfolioImage, Document,
  UserCreateRequest, ProfileCreateRequest, ProfileUpdateRequest,
  BidCreateRequest, PortfolioItemCreateRequest, PortfolioItemUpdateRequest,
  ProjectStatus, PaymentType, ProficiencyLevel,
} from '../types';

const BL = process.env.NEXT_PUBLIC_BL_URL!;

// ─── Users ────────────────────────────────────────────────────────────────────

export const createUser = (data: UserCreateRequest) =>
  apiFetch<User>(BL, '/users', { method: 'POST', body: JSON.stringify(data) });

export const getUser = (userId: string) =>
  apiFetch<User>(BL, `/users/${userId}`);

export const getUserByEmail = (email: string) =>
  apiFetch<User>(BL, `/users/by-email?email=${encodeURIComponent(email)}`);

// ─── Profiles ─────────────────────────────────────────────────────────────────

export interface ListProfilesParams {
  role?: string;
  limit?: number;
  offset?: number;
}

export const listProfiles = (params: ListProfilesParams = {}) => {
  const q = new URLSearchParams();
  if (params.role) q.set('role', params.role);
  if (params.limit != null) q.set('limit', String(params.limit));
  if (params.offset != null) q.set('offset', String(params.offset));
  return apiFetch<Profile[]>(BL, `/profiles?${q}`);
};

export const createProfile = (data: ProfileCreateRequest) =>
  apiFetch<Profile>(BL, '/profiles', { method: 'POST', body: JSON.stringify(data) });

export const getProfile = (userId: string) =>
  apiFetch<Profile>(BL, `/profiles/${userId}`);

export const updateProfile = (userId: string, requesterId: string, data: ProfileUpdateRequest) =>
  apiFetch<Profile>(BL, `/profiles/${userId}?requester_id=${requesterId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// ─── Skills ───────────────────────────────────────────────────────────────────

export const listSkills = (q?: string) =>
  apiFetch<Skill[]>(BL, `/skills${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export const createSkill = (name: string) =>
  apiFetch<Skill>(BL, '/skills', {
    method: 'POST',
    body: JSON.stringify({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }),
  });

export const getProfileSkills = (userId: string) =>
  apiFetch<ProfileSkill[]>(BL, `/skills/profile/${userId}`);

export const addProfileSkill = (userId: string, skillId: string) =>
  apiFetch<ProfileSkill>(BL, '/skills/profile', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, skill_id: skillId }),
  });

export const removeProfileSkill = (userId: string, skillId: string) =>
  apiFetch<void>(BL, `/skills/profile?user_id=${userId}&skill_id=${skillId}`, { method: 'DELETE' });

// ─── Categories ───────────────────────────────────────────────────────────────

export const listCategories = () =>
  apiFetch<Category[]>(BL, '/categories');

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface ListProjectsParams {
  status?: ProjectStatus;
  user_id?: string;
  category_id?: string;
  payment_type?: PaymentType;
  required_grade?: ProficiencyLevel;
  is_urgent?: boolean;
  user_plan?: string;
  limit?: number;
  offset?: number;
}

export const listProjects = (params: ListProjectsParams = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null) q.set(k, String(v));
  });
  return apiFetch<Project[]>(BL, `/projects?${q}`);
};

export interface ProjectCreateRequest {
  user_id: string;
  title: string;
  description: string;
  payment_type: 'FIXED' | 'HOURLY' | 'AUCTION';
  budget: { amount?: number; min?: number; max?: number };
  category_id?: string;
  required_grade?: ProficiencyLevel;
  is_urgent?: boolean;
  skill_ids?: string[];
}

export const createProject = (data: ProjectCreateRequest) =>
  apiFetch<Project>(BL, '/projects', { method: 'POST', body: JSON.stringify(data) });

export const getProject = (projectId: string, userPlan?: string) => {
  const q = userPlan ? `?user_plan=${userPlan}` : '';
  return apiFetch<Project>(BL, `/projects/${projectId}${q}`);
};

// ─── Bids ─────────────────────────────────────────────────────────────────────

export const listUserBids = (userId: string) =>
  apiFetch<Bid[]>(BL, `/bids?user_id=${userId}`);

export const listBids = (projectId: string) =>
  apiFetch<Bid[]>(BL, `/projects/${projectId}/bids`);

export const createBid = (projectId: string, data: BidCreateRequest) =>
  apiFetch<Bid>(BL, `/projects/${projectId}/bids`, { method: 'POST', body: JSON.stringify(data) });

export const updateBidStatus = (projectId: string, bidId: string, userId: string, status: string) =>
  apiFetch<Bid>(BL, `/projects/${projectId}/bids/${bidId}/status?user_id=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const listUserReviews = (userId: string) =>
  apiFetch<Review[]>(BL, `/reviews/${userId}`);

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const listPortfolio = (userId: string) =>
  apiFetch<PortfolioItem[]>(BL, `/portfolio/${userId}`);

export const getPortfolioItem = (itemId: string) =>
  apiFetch<PortfolioItem>(BL, `/portfolio/item/${itemId}`);

export const createPortfolioItem = (data: PortfolioItemCreateRequest) =>
  apiFetch<PortfolioItem>(BL, '/portfolio', { method: 'POST', body: JSON.stringify(data) });

export const updatePortfolioItem = (itemId: string, userId: string, data: PortfolioItemUpdateRequest) =>
  apiFetch<PortfolioItem>(BL, `/portfolio/${itemId}?user_id=${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deletePortfolioItem = (itemId: string, userId: string) =>
  apiFetch<void>(BL, `/portfolio/${itemId}?user_id=${userId}`, { method: 'DELETE' });

export const listPortfolioImages = (itemId: string) =>
  apiFetch<PortfolioImage[]>(BL, `/portfolio/${itemId}/images`);

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export const listBookmarks = (userId: string) =>
  apiFetch<Project[]>(BL, `/bookmarks?user_id=${userId}`);

export const addBookmark = (projectId: string, userId: string) =>
  apiFetch<void>(BL, `/bookmarks/${projectId}?user_id=${userId}`, { method: 'POST' });

export const removeBookmark = (projectId: string, userId: string) =>
  apiFetch<void>(BL, `/bookmarks/${projectId}?user_id=${userId}`, { method: 'DELETE' });

// ─── Documents ────────────────────────────────────────────────────────────────

export const listDocuments = (userId: string) =>
  apiFetch<Document[]>(BL, `/uploads/documents/${userId}`);

// ─── Uploads (FormData, no JSON) ─────────────────────────────────────────────

export const uploadAvatar = (userId: string, requesterId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<Profile>(BL, `/uploads/avatar/${userId}?requester_id=${requesterId}`, {
    method: 'POST',
    headers: {},
    body: form,
  });
};
