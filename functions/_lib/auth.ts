const COOKIE_NAME = 'referee_session';
const COOKIE_PATH = 'Path=/; HttpOnly; Secure; SameSite=Lax';
const DEFAULT_SESSION_DURATION_SECONDS = 43_200;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bytesToBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/u, '');

const base64UrlToBytes = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const sign = async (payload: string, secret: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));

  return bytesToBase64Url(new Uint8Array(signature));
};

const createSessionValue = async (
  secret: string,
  maxAgeSeconds: number,
  nowMs: number = Date.now(),
): Promise<string> => {
  const payload = JSON.stringify({
    role: 'referee',
    exp: nowMs + maxAgeSeconds * 1_000,
  });
  const encodedPayload = bytesToBase64Url(encoder.encode(payload));
  const signature = await sign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
};

const getCookie = (cookieHeader: string, name: string): string | null => {
  const cookies = cookieHeader.split(';').map((entry) => entry.trim());

  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return cookie.slice(name.length + 1);
    }
  }

  return null;
};

export const createSessionCookie = async (
  secret: string,
  maxAgeSeconds: number = DEFAULT_SESSION_DURATION_SECONDS,
): Promise<string> => {
  const value = await createSessionValue(secret, maxAgeSeconds);

  return `${COOKIE_NAME}=${value}; Max-Age=${maxAgeSeconds}; ${COOKIE_PATH}`;
};

export const clearSessionCookie = (): string =>
  `${COOKIE_NAME}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${COOKIE_PATH}`;

export const verifySessionFromCookieHeader = async (
  cookieHeader: string,
  secret: string,
  nowMs: number = Date.now(),
): Promise<boolean> => {
  const value = getCookie(cookieHeader, COOKIE_NAME);

  if (!value) {
    return false;
  }

  const [encodedPayload, signature] = value.split('.');

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = await sign(encodedPayload, secret);

  if (expectedSignature !== signature) {
    return false;
  }

  try {
    const payload = JSON.parse(decoder.decode(base64UrlToBytes(encodedPayload))) as {
      role?: string;
      exp?: number;
    };

    return payload.role === 'referee' && typeof payload.exp === 'number' && payload.exp > nowMs;
  } catch {
    return false;
  }
};
