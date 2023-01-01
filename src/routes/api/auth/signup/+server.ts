import { handleRedirect } from '../../../../lib/auth';
import type { RequestEvent } from './$types';

export function GET(request: RequestEvent): Response {
  return handleRedirect(request, { screen_hint: 'signup' })
}