import { StartServer, createHandler, renderAsync } from 'solid-start/entry-server';
import { RateLimitMiddleware } from './ratelimiter';

export default createHandler(
	RateLimitMiddleware,
	renderAsync((event) => <StartServer event={event} />)
);
