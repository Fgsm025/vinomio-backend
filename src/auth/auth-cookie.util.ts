import type { Response } from 'express';

const COOKIE_NAME = 'auth_token';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Cross-origin SPA (e.g. cropai.es) → API on another host (e.g. *.koyeb.app) needs
 * `SameSite=None` + `Secure`. In production we always set that; do not gate on
 * `FRONTEND_URL` (typos, www vs apex, or missing env broke login).
 * Local/dev stays `lax` + non-secure so http:// localhost still works.
 */
function authCookieSecurity(): { secure: boolean; sameSite: 'lax' | 'none' } {
  if (process.env.NODE_ENV !== 'production') {
    return { secure: false, sameSite: 'lax' };
  }
  return { secure: true, sameSite: 'lax' };
}

export function setAuthCookie(res: Response, token: string): void {
  const { secure, sameSite } = authCookieSecurity();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: ONE_DAY_MS,
  });
}

export function clearAuthCookie(res: Response): void {
  const { secure, sameSite } = authCookieSecurity();
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  });
}
