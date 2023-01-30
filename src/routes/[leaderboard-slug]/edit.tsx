import { RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';
import { z } from 'zod';
import { prisma } from '~/db';
import { getSession } from '../api/auth/[...solidauth]';
import { type routeData as ParentRouteData } from '../[leaderboard-slug]';

export function routeData(input: RouteDataArgs<typeof ParentRouteData>) {
	return createServerData$(
		async ([, leaderboard], { request }) => {
			if (!leaderboard || !leaderboard.ownerId) {
				throw redirect('/');
			}
			const session = await getSession(request);

			if (session?.user?.id !== leaderboard.ownerId) throw redirect('/');
			return leaderboard;
		},
		{ key: () => ['leaderboard-edit', input.data.latest] as const }
	);
}

export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();
	return <div>{data.latest && <></>}</div>;
}
