import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Match, KnockoutMatches } from '../../src/data/tournament';

const store = vi.hoisted(() => ({
  getGroupMatches: vi.fn(),
  getKnockoutMatches: vi.fn(),
  updateGroupMatch: vi.fn(),
  updateKnockoutMatch: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  createSessionCookie: vi.fn(),
  clearSessionCookie: vi.fn(),
  verifySessionFromCookieHeader: vi.fn(),
}));

vi.mock('../_lib/matchStore', () => store);
vi.mock('../_lib/auth', () => auth);

const sampleMatches: Match[] = [
  { id: 'G1', time: '10:00-10:20', field: 1, team1: 'Azus 1', team2: 'Trempats 2' },
];

const sampleKnockout: KnockoutMatches = {
  roundOf16: [],
  quarterFinals: [],
  semiFinals: [],
  thirdPlace: { id: 'TP-1', time: '20:00-20:35', field: 1, description: '3r i 4t Finalista' },
  final: { id: 'F-1', time: '20:35-21:10', field: 1, description: 'Final' },
};

const createContext = (overrides: Partial<Record<string, unknown>> = {}) => ({
  request: new Request('https://example.com'),
  env: {
    DB: {} as never,
    REFEREE_PASSWORD: 'tenimaleta',
    SESSION_SECRET: 'secret',
  },
  params: {},
  data: {},
  waitUntil: vi.fn(),
  next: vi.fn(),
  ...overrides,
});

describe('Pages Functions API', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns group matches through GET /api/matches', async () => {
    store.getGroupMatches.mockResolvedValue(sampleMatches);
    const { onRequestGet } = await import('./matches');

    const response = await onRequestGet(createContext());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(sampleMatches);
  });

  it('returns knockout matches through GET /api/knockout', async () => {
    store.getKnockoutMatches.mockResolvedValue(sampleKnockout);
    const { onRequestGet } = await import('./knockout');

    const response = await onRequestGet(createContext());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(sampleKnockout);
  });

  it('rejects unauthorized match updates', async () => {
    auth.verifySessionFromCookieHeader.mockResolvedValue(false);
    const { onRequestPut } = await import('./matches/[index]');

    const response = await onRequestPut(
      createContext({
        params: { index: '0' },
        request: new Request('https://example.com/api/matches/0', {
          method: 'PUT',
          headers: { cookie: '' },
          body: JSON.stringify({ score1: 1, score2: 0 }),
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it('returns 404 when updating an out-of-range match', async () => {
    auth.verifySessionFromCookieHeader.mockResolvedValue(true);
    store.updateGroupMatch.mockResolvedValue(null);
    const { onRequestPut } = await import('./matches/[index]');

    const response = await onRequestPut(
      createContext({
        params: { index: '999' },
        request: new Request('https://example.com/api/matches/999', {
          method: 'PUT',
          headers: { cookie: 'referee_session=token' },
          body: JSON.stringify({ score1: 1, score2: 0 }),
        }),
      }),
    );

    expect(response.status).toBe(404);
  });

  it('returns 404 when updating an invalid knockout round', async () => {
    auth.verifySessionFromCookieHeader.mockResolvedValue(true);
    store.updateKnockoutMatch.mockResolvedValue(null);
    const { onRequestPut } = await import('./knockout/[round]/[index]');

    const response = await onRequestPut(
      createContext({
        params: { round: 'invalid', index: '0' },
        request: new Request('https://example.com/api/knockout/invalid/0', {
          method: 'PUT',
          headers: { cookie: 'referee_session=token' },
          body: JSON.stringify({ score1: 1, score2: 0 }),
        }),
      }),
    );

    expect(response.status).toBe(404);
  });

  it('logs referees in with a signed cookie', async () => {
    auth.createSessionCookie.mockResolvedValue('referee_session=signed-token; HttpOnly; Path=/');
    const { onRequestPost } = await import('./auth/login');

    const response = await onRequestPost(
      createContext({
        request: new Request('https://example.com/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ password: 'tenimaleta' }),
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Set-Cookie')).toContain('referee_session=signed-token');
    await expect(response.json()).resolves.toEqual({ isReferee: true });
  });

  it('reports a guest session when the cookie is missing or invalid', async () => {
    auth.verifySessionFromCookieHeader.mockResolvedValue(false);
    const { onRequestGet } = await import('./auth/session');

    const response = await onRequestGet(
      createContext({
        request: new Request('https://example.com/api/auth/session', {
          headers: { cookie: '' },
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ isReferee: false });
  });
});
