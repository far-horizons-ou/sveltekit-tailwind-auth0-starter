import { handleCallback } from '../../../../lib/auth';
import type { RequestEvent } from './$types';

export async function GET(request: RequestEvent): Promise<Response> {
  return await handleCallback(request)
}