export const jsonResponse = (body: unknown, init?: ResponseInit): Response =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init?.headers ?? {}),
    },
  });

export const errorResponse = (status: number, message: string): Response =>
  jsonResponse({ error: message }, { status });

export const parseJsonBody = async <T>(request: Request): Promise<T> => {
  const raw = await request.text();

  return raw ? (JSON.parse(raw) as T) : ({} as T);
};
