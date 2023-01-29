import { For } from 'solid-js';
import { A, RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { Loading } from '~/components/Loading';
import { prisma } from '~/db';
import { type routeData as ParentRouteData } from '../[leaderboard-slug]';

export function routeData(input: RouteDataArgs<typeof ParentRouteData>) {
	return createServerData$(
		async ([, id]) => {
			if (!id) return null;

			const res = (await prisma.option.findMany({ where: { leaderboardId: id } })).sort(() => Math.random() - 0.5);
			if (res.length < 2) return null;
			return [res[0], res[1]] as const;
		},
		{ key: () => ['leaderboard-options', input.data.latest?.id] }
	);
}

export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();

	return (
		<div>
			<Loading isLoading={data.loading} />
			{data.latest ? (
				<>
					<div class="mt-8 flex w-full justify-evenly gap-3">
						<For each={data.latest}>
							{(option) => (
								<button type="button" class="group relative flex flex-col items-center rounded-md border-2 border-gray-500 bg-transparent">
									<img class="absolute w-64 scale-0 opacity-40 blur-2xl transition-transform group-hover:scale-100 sm:w-80" src={option.image ?? ''} alt={option.content} />
									<img class="w-48 sm:w-64" src={option.image ?? ''} alt={option.content} />
									<p>{option.content}</p>
								</button>
							)}
						</For>
					</div>
					<div class="mt-8">
						<A href=".." class="rounded-md bg-red-500 py-2 px-4 hover:bg-red-600">
							View Results
						</A>
					</div>
				</>
			) : (
				'NOT FOUND'
			)}
		</div>
	);
}
