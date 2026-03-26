/**
 * Environment helpers.
 *
 * BACKEND_HOST is server-side only (used in Next.js Route Handlers).
 * NEXT_PUBLIC_MESSENGER_HOST is exposed to the browser for WebSocket connections.
 */

const DEFAULT_BACKEND_HOST = 'http://localhost:8088';
const DEFAULT_MESSENGER_HOST = 'http://localhost:8089';

function normalizeOrigin(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, ''); // remove trailing slash

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      `Invalid BACKEND_HOST: "${value}". Expected a full URL like "http://localhost:8088".`,
    );
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(
      `Invalid BACKEND_HOST protocol: "${url.protocol}". Use http or https.`,
    );
  }

  // Keep only the origin (drops path/query/hash if provided)
  return url.origin;
}

/**
 * api-gateway origin, used server-side by Next.js Route Handler proxies.
 * Set BACKEND_HOST env var to override (e.g. http://api_gateway:8088 in Docker).
 */
export const BACKEND_HOST: string = (() => {
  const raw = process.env.BACKEND_HOST ?? process.env.NEXT_PUBLIC_BACKEND_HOST;
  if (!raw) return DEFAULT_BACKEND_HOST;
  return normalizeOrigin(raw);
})();

/**
 * Messenger service origin, used by the browser for WebSocket (SignalR) connections.
 * Set NEXT_PUBLIC_MESSENGER_HOST to override.
 */
export const MESSENGER_HOST: string = (() => {
  const raw = process.env.NEXT_PUBLIC_MESSENGER_HOST;
  if (!raw) return DEFAULT_MESSENGER_HOST;
  return normalizeOrigin(raw);
})();
