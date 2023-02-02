import { Suspense } from 'solid-js';
import { type RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$, redirect } from 'solid-start/server';
import { CreateLeaderboardForm } from '~/components/CreateLeaderboardForm';
import { Loading } from '~/components/Loading';
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
			<Suspense
				fallback={
					<div class="grid h-[40vh] w-full place-items-center">
						<Loading isLoading />
					</div>
				}
			>
				{data() && <CreateLeaderboardForm leaderboardData={data.latest} name="" ref={ref} />}
			</Suspense>
		</div>
	);
}
