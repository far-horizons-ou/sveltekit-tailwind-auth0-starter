import type { RequestEvent } from './$types';
import { env } from '$env/dynamic/private';

export function handleRedirect(
  request: RequestEvent,
  { screen_hint }: { screen_hint: string },
): Response {
  console.log(env, request)
  const returnUrl = new URL(request.url)
  returnUrl.pathname = '/api/auth/callback'

  const queryString = new URLSearchParams({
    response_type: 'code',
    client_id: `${env.AUTH0_CLIENT_ID}`,
    redirect_uri: `${returnUrl.toString()}`,
    scope: 'openid profile email',
    audience: `${env.AUTH0_AUDIENCE}`,
    screen_hint,
  }).toString()
  const redirectUrl = `${env.AUTH0_ISSUER_BASE_URL}/authorize?${queryString}`

  return Response.redirect(redirectUrl, 302)
}

export function GET(request: RequestEvent): Response {
  return handleRedirect(request, { screen_hint: 'login' })
}