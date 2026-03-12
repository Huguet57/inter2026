import type { PagesFunctionContext } from '../_lib/cloudflare';
import { errorResponse, jsonResponse } from '../_lib/http';
import { getKnockoutMatches } from '../_lib/matchStore';

export const onRequestGet = async ({ env }: PagesFunctionContext): Promise<Response> => {
  try {
    const knockoutMatches = await getKnockoutMatches(env.DB);
    return jsonResponse(knockoutMatches);
  } catch (error) {
    console.error('Error reading knockout matches:', error);
    return errorResponse(500, 'Failed to read knockout matches');
  }
};
