export const DEFAULT_CLIENT_PORT = 5173;
export const DEFAULT_API_PORT = 3001;

export const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const resolveSiteUrl = (siteUrl: string | undefined, fallbackSiteUrl: string): string =>
  trimTrailingSlash(siteUrl || fallbackSiteUrl);
