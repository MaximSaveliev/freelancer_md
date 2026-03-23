import { decodeCookieValue, getCookie } from '@/lib/cookie';

export type ApiResult<T> = { ok: true; data: T } | { ok: false, error: string; status?: number };

async function readErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (typeof json === 'string') return json;
      if (json && typeof json.message === 'string') return json.message;
      return JSON.stringify(json);
    }
    const text = await res.text();
    return text || res.statusText;
  } catch {
    return res.statusText || 'Request failed';
  }
}

const AUTH_PROXY_BASE = '/api/auth';

function authProxyUrl(path: string): string {
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${AUTH_PROXY_BASE}${cleaned}`;
}

export type TokensDto = {
  accessToken: string;
  refreshToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export async function login(request: LoginRequest): Promise<ApiResult<TokensDto>> {
  const res = await fetch(authProxyUrl('/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    credentials: 'include',
  });

  if (!res.ok) {
    return { ok: false, status: res.status, error: await readErrorMessage(res) };
  }

  const data = (await res.json()) as TokensDto;
  return { ok: true, data };
}

export type RefreshRequest = {
  refreshToken?: string;
};

export async function refreshTokens(request: RefreshRequest = {}): Promise<ApiResult<TokensDto>> {
  // Backend currently reads refresh token from body (see AuthController.endpoints.md).
  // Cookies are URL-encoded, DB token is usually raw base64, so decode it.
  const cookieRefresh = getCookie('refreshToken');
  const normalizedRefresh = cookieRefresh ? decodeCookieValue(cookieRefresh) : undefined;

  const res = await fetch(authProxyUrl('/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken: request.refreshToken ?? normalizedRefresh,
    }),
    credentials: 'include',
  });

  if (!res.ok) {
    return { ok: false, status: res.status, error: await readErrorMessage(res) };
  }

  const data = (await res.json()) as TokensDto;
  return { ok: true, data };
}

export type UserViewDto = {
  id: number;
  email: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export async function register(request: RegisterRequest): Promise<ApiResult<UserViewDto>> {
  const res = await fetch(authProxyUrl('/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    credentials: 'include',
  });

  if (!res.ok) {
    return { ok: false, status: res.status, error: await readErrorMessage(res) };
  }

  const data = (await res.json()) as UserViewDto;
  return { ok: true, data };
}

export type ConfirmEmailRequest = {
  email: string;
  token: string; // 6-digit
};

export async function confirmEmail(request: ConfirmEmailRequest): Promise<ApiResult<{ message: string }>> {
  const res = await fetch(authProxyUrl('/confirm-email'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    credentials: 'include',
  });

  if (!res.ok) {
    return { ok: false, status: res.status, error: await readErrorMessage(res) };
  }

  const data = (await res.json()) as { message: string };
  return { ok: true, data };
}

export type ResendEmailConfirmationRequest = {
  email: string;
};

export async function resendEmailConfirmation(
  request: ResendEmailConfirmationRequest,
): Promise<ApiResult<{ message: string }>> {
  const res = await fetch(authProxyUrl('/resend-email-confirmation'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    credentials: 'include',
  });

  if (!res.ok) {
    return { ok: false, status: res.status, error: await readErrorMessage(res) };
  }

  const data = (await res.json()) as { message: string };
  return { ok: true, data };
}
