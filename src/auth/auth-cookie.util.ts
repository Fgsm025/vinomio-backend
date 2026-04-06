import type { Response } from 'express';

const COOKIE_NAME = 'auth_token';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * `SameSite=None` requires `Secure`. Browsers drop `Secure` cookies on http:// (e.g. localhost),
 * so we only use cross-site prod cookies when the configured frontend is HTTPS.
 * Non-production always uses `lax` + non-secure so local/dev login works.
 */
function authCookieSecurity(): { secure: boolean; sameSite: 'lax' | 'none' } {
  if (process.env.NODE_ENV !== 'production') {
    return { secure: false, sameSite: 'lax' };
  }
  const frontend = process.env.FRONTEND_URL ?? '';
  const frontendIsHttps = frontend.startsWith('https://');
  if (!frontendIsHttps) {
    return { secure: false, sameSite: 'lax' };
  }
  return { secure: true, sameSite: 'none' };
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
