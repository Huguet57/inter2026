import type { PagesFunctionContext } from '../../_lib/cloudflare';
import { verifySessionFromCookieHeader } from '../../_lib/auth';
import { jsonResponse } from '../../_lib/http';

export const onRequestGet = async (
  { env, request }: PagesFunctionContext,
): Promise<Response> => {
  const isReferee = await verifySessionFromCookieHeader(
    request.headers.get('cookie') ?? '',
    env.SESSION_SECRET,
  );

  return jsonResponse({ isReferee });
};
