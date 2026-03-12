const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? '');

export const buildApiUrl = (path: string): string => `${API_BASE_URL}${path}`;
