import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { redirect } from 'solid-start';
import type { Middleware } from 'solid-start/entry-server';

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(100, '20 s'),
});

export const RateLimitMiddleware: Middleware = ({ forward }) => {
	return async (event) => {
		const request = event.request;
		const ip = event.clientAddress;
		const url = new URL(request.url);
		if (url.pathname === '/blocked') {
			return forward(event);
		}
		const { success, pending } = await ratelimit.limit(`mw_${ip}`);

		const res = await pending.then(() => {
			if (success) {
				return forward(event);
			} else {
				return redirect(url.origin + '/blocked');
			}
		});
		return res;
	};
};
