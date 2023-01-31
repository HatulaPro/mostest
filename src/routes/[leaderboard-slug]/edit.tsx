import { RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';
import { CreateLeaderboardForm } from '~/components/CreateLeaderboardForm';
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
			return { leaderboard, options: await prisma.option.findMany({ where: { leaderboardId: leaderboard.id } }) };
		},
		{ key: () => ['leaderboard-edit', input.data.latest] as const }
	);
}

export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();
	let ref: HTMLFormElement | undefined;
	return (
		<div>
			{data.latest && (
				<>
					<CreateLeaderboardForm leaderboardData={data.latest} name="" ref={ref} />
				</>
			)}
		</div>
	);
}
