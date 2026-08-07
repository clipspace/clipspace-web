import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

const COOKIE_NAME = "clipspace_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/** The password from the environment, or null when the admin panel is off. */
export function adminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

/** No password configured means the whole admin area is disabled. */
export function isAdminEnabled(): boolean {
  return adminPassword() !== null;
}

// timingSafeEqual throws when the buffers differ in length, which would leak
// the password length. Comparing HMACs of the inputs keeps both sides the
// same size; the key is random per process so the digests can't be precomputed.
const COMPARE_KEY = randomBytes(32);

function constantTimeEquals(a: string, b: string): boolean {
  const hashA = createHmac("sha256", COMPARE_KEY).update(a, "utf8").digest();
  const hashB = createHmac("sha256", COMPARE_KEY).update(b, "utf8").digest();
  return timingSafeEqual(hashA, hashB);
}

export function verifyPassword(input: string): boolean {
  const password = adminPassword();
  if (!password) return false;
  return constantTimeEquals(input, password);
}

// The session token is signed with the password itself, so changing
// ADMIN_PASSWORD invalidates every outstanding session for free.
function sign(payload: string, password: string): string {
  return createHmac("sha256", password).update(payload).digest("hex");
}

function createToken(password: string): string {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return `${expiresAt}.${sign(expiresAt, password)}`;
}

function isTokenValid(token: string | undefined): boolean {
  const password = adminPassword();
  if (!password || !token) return false;

  const separator = token.indexOf(".");
  if (separator === -1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!constantTimeEquals(signature, sign(expiresAt, password))) return false;

  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > Date.now();
}

/** True when the current request carries a valid admin session cookie. */
export async function isAuthenticated(): Promise<boolean> {
  if (!isAdminEnabled()) return false;
  const store = await cookies();
  return isTokenValid(store.get(COOKIE_NAME)?.value);
}

export async function startSession(): Promise<void> {
  const password = adminPassword();
  if (!password) return;
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// Login throttle. Per-process and therefore best-effort on serverless, but it
// still blunts naive password guessing; the WAF handles volume attacks.
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

/** Counts one login attempt. Returns false once the caller is over the limit. */
export function allowLoginAttempt(key: string): boolean {
  return rateLimit(`admin:login:${key}`, MAX_ATTEMPTS, ATTEMPT_WINDOW_MS).ok;
}

/** Called after a successful login so a correct password clears the count. */
export function clearLoginAttempts(key: string): void {
  resetRateLimit(`admin:login:${key}`);
}
