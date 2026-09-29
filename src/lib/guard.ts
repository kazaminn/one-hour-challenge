import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import { countRecentHits } from './db';

function sha256(value: string) {
  return createHash('sha256').update(value).digest();
}

export function isAdmin(req: Request): boolean {
  const token = process.env.ADMIN_TOKEN;
  const given = req.headers.get('x-admin-token');
  if (!token || !given) return false;
  // Hash first so both sides have equal length for timingSafeEqual.
  return timingSafeEqual(sha256(given), sha256(token));
}

/**
 * Rejects anything but a JSON body. A cross-site <form> can only send
 * text/plain / urlencoded / multipart without a CORS preflight, so this
 * blocks CSRF-style posts from other origins.
 */
export function isJson(req: Request): boolean {
  return req.headers.get('content-type')?.split(';')[0]?.trim() === 'application/json';
}

function clientKey(req: Request, bucket: string): string {
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  // Never store raw IPs; salt with a server secret so hashes can't be reversed
  // by trying every IPv4 address.
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt && process.env.NODE_ENV === 'production') {
    throw new Error('RATE_LIMIT_SALT is not set');
  }
  return sha256(`${salt ?? 'dev'}:${bucket}:${ip}`).toString('hex');
}

/** True when this client made `limit` or more requests to `bucket` within `windowSec`. */
export async function isRateLimited(
  req: Request,
  bucket: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  return (await countRecentHits(clientKey(req, bucket), windowSec)) > limit;
}

export function badRequest(error: string, status = 400) {
  return Response.json({ error }, { status });
}

/** Common checks for public write endpoints. Returns an error response, or null to proceed. */
export async function guardWrite(req: Request, bucket: string, limit: number, windowSec = 60) {
  if (!isJson(req)) return badRequest('content-type must be application/json', 415);
  if (await isRateLimited(req, bucket, limit, windowSec)) {
    return badRequest('too many requests', 429);
  }
  return null;
}
