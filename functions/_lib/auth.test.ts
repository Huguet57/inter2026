import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearSessionCookie,
  createSessionCookie,
  verifySessionFromCookieHeader,
} from './auth';

const TEST_SECRET = 'super-secret-session-key';

describe('session cookies', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T19:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a valid signed cookie and verifies it from the request header', async () => {
    const cookie = await createSessionCookie(TEST_SECRET);
    const header = cookie.split(';', 1)[0];

    await expect(verifySessionFromCookieHeader(header, TEST_SECRET)).resolves.toBe(true);
  });

  it('rejects expired cookies', async () => {
    const cookie = await createSessionCookie(TEST_SECRET, 1);
    const header = cookie.split(';', 1)[0];

    vi.advanceTimersByTime(2_000);

    await expect(verifySessionFromCookieHeader(header, TEST_SECRET)).resolves.toBe(false);
  });

  it('returns a clearing cookie for logout', () => {
    expect(clearSessionCookie()).toContain('Max-Age=0');
    expect(clearSessionCookie()).toContain('referee_session=');
  });
});
