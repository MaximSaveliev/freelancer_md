import { BACKEND_HOST } from './env';

// From docs/AuthController.endpoints.md
export const AUTH_BASE_PATH = '/v1/api/auth';

/** Build a backend URL for AuthController endpoints. */
export function authUrl(path: string): string {
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_HOST}${AUTH_BASE_PATH}${cleaned}`;
}

