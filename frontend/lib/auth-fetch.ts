'use client';

import { ensureAccessToken } from '@/lib/session';
import { decodeCookieValue, getCookie } from '@/lib/cookie';

function getBearerFromCookie(): string | null {
  const raw = getCookie('accessToken');
  if (!raw) return null;
  return decodeCookieValue(raw);
}

/**
 * Fetch wrapper that:
 * 1) Ensures a (fresh) access token exists before calling.
 * 2) Adds Authorization: Bearer <token>.
 * 3) If response is 401, refreshes once and retries.
 *
 * Note: Your backend also sets cookies. We still include credentials.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  // Ensure (refresh if needed).
  await ensureAccessToken();

  const token = getBearerFromCookie();
  const headers = new Headers(init.headers);
  if (token) headers.set('authorization', `Bearer ${token}`);

  const first = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (first.status !== 401) return first;

  // One retry after refresh
  await ensureAccessToken();
  const token2 = getBearerFromCookie();
  const headers2 = new Headers(init.headers);
  if (token2) headers2.set('authorization', `Bearer ${token2}`);

  return fetch(input, {
    ...init,
    headers: headers2,
    credentials: 'include',
  });
}
