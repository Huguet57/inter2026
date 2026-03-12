import type { PagesFunctionContext } from '../../_lib/cloudflare';
import { verifySessionFromCookieHeader } from '../../_lib/auth';
import { errorResponse, jsonResponse, parseJsonBody } from '../../_lib/http';
import { updateGroupMatch, type MatchUpdateInput } from '../../_lib/matchStore';

export const onRequestPut = async (
  { env, params, request }: PagesFunctionContext<{ index: string }>,
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
    const updatedMatch = await updateGroupMatch(env.DB, index, updates);

    if (!updatedMatch) {
      return errorResponse(404, 'Match not found');
    }

    return jsonResponse(updatedMatch);
  } catch (error) {
    console.error('Error updating match:', error);
    return errorResponse(500, `Failed to update match: ${(error as Error).message}`);
  }
};
