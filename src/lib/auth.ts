import { env } from "$env/dynamic/private"
import type { RequestEvent } from "@sveltejs/kit"
import jwksClient from "jwks-rsa"
import jwt from "jsonwebtoken"
import * as cookie from "cookie"

type AuthResponse = {
  access_token: string
  id_token: string
  scope: string
  expires_in: number
  token_type: string
}

export async function exchangeCodeForToken(
  request: RequestEvent,
): Promise<AuthResponse> {
  const returnUrl = new URL(request.url)
  returnUrl.pathname = '/'
  const url = new URL(request.url)
  const init = {
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: env.AUTH0_CLIENT_ID,
      client_secret: env.AUTH0_CLIENT_SECRET,
      code: url.searchParams.get('code'),
      redirect_uri: returnUrl,
      scope: 'openid profile email',
    }),
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  }
  const res = await fetch(`https://${env.AUTH0_DOMAIN}/oauth/token`, init)
  return await res.json()
}

export const parseUser = async (authResponse: AuthResponse) => {
  console.log('authResponse', authResponse)
  const { id_token } = authResponse
  const parsed = await parseIdToken(id_token)
  const user = {
    auth0Id: parsed.sub,
    email: parsed.email,
    name: parsed.name,
    pictureUrl: parsed.picture,
  }
  return user
}

export const verifyToken = async (token: string): Promise<[err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | undefined]> => {
  return new Promise((resolve, reject) => {
  const client = jwksClient({
    jwksUri: `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    requestHeaders: {}, // Optional
    timeout: 30000 // Defaults to 30s
  });
  
  function getKey(header: any, callback: any){
    client.getSigningKey(header.kid, function (err, key) {
      if (err || !key) {
        callback(err, key);
        return;
      }
      const signingKey = 'publicKey' in key ? key.publicKey : key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

    jwt.verify(token, getKey, {}, function (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) {
      if (err || !decoded || typeof decoded === 'string') {
        return reject([err,])
      }
      resolve([null, decoded])
    })
  })
}

export const parseIdToken = async (
  idToken: string,
): Promise<{
  sub: string | undefined
  email: string
  name: string
  picture: string
}> => {
  const [err, decoded] = await verifyToken(idToken)
  if (err || !decoded) {
    throw err
  }
  return {
    sub: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
  }
}


export function handleRedirect(
  request: RequestEvent,
  { screen_hint }: { screen_hint: string },
): Response {
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
  const redirectUrl = `https://${env.AUTH0_DOMAIN}/authorize?${queryString}`

  return Response.redirect(redirectUrl, 302)
}

export async function handleCallback(request: RequestEvent): Promise<Response> {
  const redirectUrl = new URL(request.url)
  redirectUrl.pathname = '/app'
  redirectUrl.searchParams.delete('code')

  const token = await exchangeCodeForToken(request)

  // This will throw an error if the token is invalid
  const user = await parseUser(token)

  const authCookie = cookie.serialize('authToken', token.access_token, {
    secure: true,
    maxAge: token.expires_in,
    path: '/',
  }) as string

  const userCookie = cookie.serialize('twirrlUser', JSON.stringify(user), {
    secure: true,
    maxAge: token.expires_in,
    path: '/',
  }) as string

  const res = new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl.toString(),
      'Set-Cookie': [authCookie, userCookie],
    },
  })
  return res
}
