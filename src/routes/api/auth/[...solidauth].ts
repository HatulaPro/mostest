import { prisma } from './../../../db/index';
import { SolidAuth, type SolidAuthConfig, getSession as getAuthSession } from '@auth/solid-start';
import GitHub from '@auth/core/providers/github';
import { serverEnv } from '~/env/server';
import { ServerError } from 'solid-start';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

export const authOpts: SolidAuthConfig = {
	adapter: PrismaAdapter(prisma),
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		},
	},
	debug: false,
	providers: [
		GitHub({
			clientId: serverEnv.GITHUB_CLIENT_ID,
			clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		}) as any,
	],
	session: {
		strategy: 'database',
		maxAge: 30 * 24 * 60 * 60,
		updateAge: 24 * 60 * 60,
		generateSessionToken: () => {
			return crypto.randomUUID();
		},
	},
};

export const getSession = (request: Request) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const unsafeRequest = request as any;

	if (!unsafeRequest.sessionPromise) {
		unsafeRequest.sessionPromise = getAuthSession(request, authOpts);
	}

	return unsafeRequest.sessionPromise;
};

export const getUser = async (request: Request) => {
	const session = await getSession(request);
	if (!session?.user) {
		throw new ServerError('UNAUTHORIZED');
	}
	return session.user;
};

export const { GET, POST } = SolidAuth(authOpts);
