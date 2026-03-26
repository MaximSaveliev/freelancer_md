import { BACKEND_HOST } from '@/lib/env';

/**
 * Proxy to BL service via api-gateway.
 *
 * Incoming: /api/bl/<path>?<query>
 * Proxies:  {BACKEND_HOST}/v1/api/bl/<path>?<query>
 */

const BL_PREFIX = '/v1/api/bl';

async function proxy(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params;
  const parts = path ?? [];
  const suffix = parts.length ? `/${parts.join('/')}` : '';
  const search = new URL(req.url).search;
  const target = `${BACKEND_HOST}${BL_PREFIX}${suffix}${search}`;

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
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
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    outHeaders.set(key, value);
  });

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
