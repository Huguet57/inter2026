import { jsonResponse } from '../_lib/http';

export const onRequestGet = async (): Promise<Response> =>
  jsonResponse({ status: 'ok', message: 'API server is running' });
