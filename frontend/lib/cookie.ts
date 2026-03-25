'use client';

/** Read a cookie value by name from document.cookie. */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(/;\s*/);
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = part.slice(0, eq);
    if (k !== name) continue;
    return part.slice(eq + 1);
  }
  return null;
}

/**
 * Cookies are URL-encoded. If the DB stores the raw base64 token,
 * decode the cookie value (e.g. %2B -> +, %3D -> =).
 */
export function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

