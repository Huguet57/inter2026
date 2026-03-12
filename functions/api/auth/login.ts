import type { PagesFunctionContext } from '../../_lib/cloudflare';
import { createSessionCookie } from '../../_lib/auth';
import { errorResponse, jsonResponse, parseJsonBody } from '../../_lib/http';

interface LoginBody {
  password?: string;
}

export const onRequestPost = async (
  { env, request }: PagesFunctionContext,
): Promise<Response> => {
  try {
    const body = await parseJsonBody<LoginBody>(request);

    if (!body.password || body.password !== env.REFEREE_PASSWORD) {
      return errorResponse(401, 'Invalid password');
    }

    const sessionCookie = await createSessionCookie(env.SESSION_SECRET);

    return jsonResponse(
      { isReferee: true },
      {
        headers: {
          'Set-Cookie': sessionCookie,
        },
      },
    );
  } catch (error) {
    console.error('Error logging in referee:', error);
    return errorResponse(500, `Failed to log in: ${(error as Error).message}`);
  }
};
