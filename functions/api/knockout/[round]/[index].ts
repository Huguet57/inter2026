import type { PagesFunctionContext } from '../../../_lib/cloudflare';
import { verifySessionFromCookieHeader } from '../../../_lib/auth';
import { errorResponse, jsonResponse, parseJsonBody } from '../../../_lib/http';
import { updateKnockoutMatch, type MatchUpdateInput } from '../../../_lib/matchStore';

export const onRequestPut = async (
  { env, params, request }: PagesFunctionContext<{ round: string; index: string }>,
): Promise<Response> => {
  try {
    const isAuthorized = await verifySessionFromCookieHeader(
      request.headers.get('cookie') ?? '',
      env.SESSION_SECRET,
    );

    if (!isAuthorized) {
      return errorResponse(401, 'Unauthorized');
    }

    const index = Number.parseInt(params.index, 10);

    if (!Number.isInteger(index) || index < 0) {
      return errorResponse(404, 'Match not found');
    }

    const updates = await parseJsonBody<MatchUpdateInput>(request);
    const knockoutMatches = await updateKnockoutMatch(env.DB, params.round, index, updates);

    if (!knockoutMatches) {
      return errorResponse(404, 'Match not found');
    }

    return jsonResponse(knockoutMatches);
  } catch (error) {
    console.error('Error updating knockout match:', error);
    return errorResponse(500, `Failed to update knockout match: ${(error as Error).message}`);
  }
};
