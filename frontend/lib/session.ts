'use client';

import { refreshTokens } from '@/lib/auth';
import { getCookie, decodeCookieValue } from '@/lib/cookie';
import { getJwtExpiryMs } from '@/lib/jwt';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

const RENEW_THRESHOLD_MS = 30_000;
const MIN_TIMER_DELAY_MS = 1_000;

function getDecodedCookie(name: string): string | null {
  const raw = getCookie(name);
  return raw ? decodeCookieValue(raw) : null;
}

function accessTokenNeedsRefresh(accessToken: string | null): boolean {
  if (!accessToken) return true;
  const expMs = getJwtExpiryMs(accessToken);
  if (!expMs) return true;
  return expMs - Date.now() <= RENEW_THRESHOLD_MS;
}

let inFlight: Promise<boolean> | null = null;
let refreshTimer: number | null = null;

function clearRefreshTimer() {
  if (refreshTimer != null) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleNextRefresh(accessToken: string | null) {
  clearRefreshTimer();

  if (!accessToken) return;
  const expMs = getJwtExpiryMs(accessToken);
  if (!expMs) return;

  const delay = Math.max(expMs - Date.now() - RENEW_THRESHOLD_MS, MIN_TIMER_DELAY_MS);
  refreshTimer = window.setTimeout(() => {
    void ensureAccessToken();
  }, delay);
}

/**
 * Simple rule-based token ensuring:
 * - If accessToken cookie missing => refresh using refreshToken cookie (backend requires body)
 * - If accessToken expires in <= 30s => refresh
 * - Otherwise do nothing
 *
 * Timer mechanism:
 * - After a successful run, schedule the next refresh for (accessExp - 30s)
 */
export async function ensureAccessToken(): Promise<boolean> {
  if (inFlight) return inFlight;

  const accessToken = getDecodedCookie(ACCESS_COOKIE);
  const refreshToken = getDecodedCookie(REFRESH_COOKIE);

  // If token is healthy, just schedule the next refresh moment and exit.
  if (!accessTokenNeedsRefresh(accessToken)) {
    scheduleNextRefresh(accessToken);
    return true;
  }

  // If we need refresh but don't have refresh token, we can't do anything.
  if (!refreshToken) {
    clearRefreshTimer();
    return false;
  }

  inFlight = (async () => {
    const res = await refreshTokens({ refreshToken });
    if (!res.ok) {
      clearRefreshTimer();
      return false;
    }

    // Backend sets new cookies; re-read access token and schedule next refresh.
    const newAccess = getDecodedCookie(ACCESS_COOKIE);
    scheduleNextRefresh(newAccess);
    return true;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
