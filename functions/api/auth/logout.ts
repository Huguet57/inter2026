import { clearSessionCookie } from '../../_lib/auth';
import { jsonResponse } from '../../_lib/http';

export const onRequestPost = async (): Promise<Response> =>
  jsonResponse(
    { isReferee: false },
    {
      headers: {
        'Set-Cookie': clearSessionCookie(),
      },
    },
  );
