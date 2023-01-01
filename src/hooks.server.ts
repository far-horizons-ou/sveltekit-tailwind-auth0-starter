import cookie from 'cookie';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { env } from "$env/dynamic/private"


export const handleRedirects = (event: RequestEvent): { shouldRedirect: false, response: null } | { shouldRedirect: true, response: Response } => {
	const { request } = event;
	const url = new URL(request.url);
	if (url.hostname === `www.${env.BASE_DOMAIN}`) {
		url.hostname = env.BASE_DOMAIN;
		return { shouldRedirect: true, response: Response.redirect(url, 301) };
	}

	const hosts = [env.BASE_DOMAIN, 'localhost'];
	// Anything under /app needs authentication
	if (hosts.includes(url.hostname) && url.pathname.startsWith('/app')) {
		// console.log(
		// 	'/app redirect check',
		// 	event.locals.decodedToken,
		// 	event.locals.decodedToken?.exp < Date.now() / 1000
		// );
		// check if jwt authToken exists and is not expired
		if (!event.locals.decodedToken || event.locals.decodedToken?.exp < Date.now() / 1000) {
			url.pathname = '/api/auth/login'; // TODO encode return path
			return { shouldRedirect: true, response: Response.redirect(url, 302) };
		}
	}

	return { shouldRedirect: false, response: null };
};

const jwtDecode = (token: string) => {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace('-', '+').replace('_', '/');
	return JSON.parse(atob(base64));
};

type HandleParams = Parameters<Handle>[0];

export const handle: Handle = async ({ event, resolve }: HandleParams): Promise<Response> => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	event.locals.authToken = cookies.authToken || null;
	if (event.locals.authToken) {
		event.locals.decodedToken = jwtDecode(event.locals.authToken);
	}

	const { shouldRedirect, response: redirect } = handleRedirects(event);
	console.log(shouldRedirect, redirect);
	if (shouldRedirect) {
		return redirect;
	}
	return resolve(event);
};
