import { BACKEND_HOST } from '@/lib/env';

/**
 * Proxy to backend AuthController.
 *
 * Incoming: /api/auth/<path>
 * Proxies:  {BACKEND_HOST}/v1/api/auth/<path>
 */

const AUTH_BASE = '/v1/api/auth';

function buildTargetUrl(pathParts: string[] | undefined): string {
  const parts = pathParts ?? [];
  const suffix = parts.length ? `/${parts.join('/')}` : '';
  return `${BACKEND_HOST}${AUTH_BASE}${suffix}`;
}

async function proxy(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params;
  const target = buildTargetUrl(path);

  // Short-circuit CORS preflight for browsers.
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        // Same-origin requests to /api/* don't need CORS, but allowing OPTIONS makes dev tools happy.
        'access-control-allow-origin': req.headers.get('origin') ?? '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'access-control-allow-headers': 'content-type, authorization',
        'access-control-max-age': '86400',
      },
    });
  }

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  const res = await fetch(target, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  });

  const outHeaders = new Headers();

  // Copy headers, but be careful with `set-cookie` (it’s special).
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    outHeaders.set(key, value);
  });

  // Forward Set-Cookie headers from backend (needed for cookie-based auth).
  // Node's fetch exposes them via `getSetCookie()`.
  const maybeHeaders = res.headers as unknown as { getSetCookie?: () => string[] };
  const setCookies = typeof maybeHeaders.getSetCookie === 'function' ? maybeHeaders.getSetCookie() : undefined;
  if (setCookies?.length) {
    for (const cookie of setCookies) {
      outHeaders.append('set-cookie', cookie);
    }
  }

  outHeaders.set('cache-control', 'no-store');

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: outHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
