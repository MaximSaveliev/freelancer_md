/**
 * Environment helpers.
 *
 * NEXT_PUBLIC_* values are exposed to the browser.
 */

const DEFAULT_BACKEND_HOST = 'https://localhost:44374';

function normalizeOrigin(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, ''); // remove trailing slash

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_BACKEND_HOST: "${value}". Expected a full URL like "https://localhost:44374".`,
    );
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(
      `Invalid NEXT_PUBLIC_BACKEND_HOST protocol: "${url.protocol}". Use http or https.`,
    );
  }

  // Keep only the origin (drops path/query/hash if provided)
  return url.origin;
}

/**
 * Backend host (origin) used by the browser to call the API.
 *
 * In dev, defaults to https://localhost:44374.
 */
export const BACKEND_HOST: string = (() => {
  const raw = process.env.NEXT_PUBLIC_BACKEND_HOST;
  if (!raw) return DEFAULT_BACKEND_HOST;
  return normalizeOrigin(raw);
})();

