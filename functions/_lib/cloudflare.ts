export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface CloudflareEnv {
  DB: D1Database;
  REFEREE_PASSWORD: string;
  SESSION_SECRET: string;
}

export interface PagesFunctionContext<
  Params extends Record<string, string> = Record<string, string>,
> {
  request: Request;
  env: CloudflareEnv;
  params: Params;
  data: Record<string, unknown>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: () => Promise<Response>;
}
