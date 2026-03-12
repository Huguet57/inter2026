import { describe, expect, it } from 'vitest';

import {
  DEFAULT_API_PORT,
  DEFAULT_CLIENT_PORT,
  parsePort,
  resolveSiteUrl,
  trimTrailingSlash,
} from './runtimeConfig';

describe('runtimeConfig', () => {
  it('uses the fallback when the port is missing or invalid', () => {
    expect(parsePort(undefined, DEFAULT_CLIENT_PORT)).toBe(DEFAULT_CLIENT_PORT);
    expect(parsePort('', DEFAULT_API_PORT)).toBe(DEFAULT_API_PORT);
    expect(parsePort('abc', DEFAULT_API_PORT)).toBe(DEFAULT_API_PORT);
    expect(parsePort('-1', DEFAULT_API_PORT)).toBe(DEFAULT_API_PORT);
  });

  it('parses valid port values', () => {
    expect(parsePort('4173', DEFAULT_CLIENT_PORT)).toBe(4173);
    expect(parsePort('3005', DEFAULT_API_PORT)).toBe(3005);
  });

  it('normalizes the site url and falls back to localhost', () => {
    expect(resolveSiteUrl(undefined, `http://localhost:${DEFAULT_CLIENT_PORT}`)).toBe(
      'http://localhost:5173',
    );
    expect(
      resolveSiteUrl(
        'https://inter2026.tenimaleta.com/',
        `http://localhost:${DEFAULT_CLIENT_PORT}`,
      ),
    ).toBe(
      'https://inter2026.tenimaleta.com',
    );
    expect(trimTrailingSlash('http://localhost:3001///')).toBe('http://localhost:3001');
  });
});
