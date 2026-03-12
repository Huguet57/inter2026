import type { PagesFunctionContext } from '../_lib/cloudflare';
import { errorResponse, jsonResponse } from '../_lib/http';
import { getGroupMatches } from '../_lib/matchStore';

export const onRequestGet = async ({ env }: PagesFunctionContext): Promise<Response> => {
  try {
    const matches = await getGroupMatches(env.DB);
    return jsonResponse(matches);
  } catch (error) {
    console.error('Error reading matches:', error);
    return errorResponse(500, 'Failed to read matches');
  }
};
