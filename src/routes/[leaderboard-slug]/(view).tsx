import { A } from '@solidjs/router';
import { For } from 'solid-js';
import { RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$, HttpHeader } from 'solid-start/server';
import { Loading } from '~/components/Loading';
import { prisma } from '~/db';
import { type routeData as ParentRouteData } from '../[leaderboard-slug]';

export function routeData(input: RouteDataArgs<typeof ParentRouteData>) {
	return createServerData$(
		async ([, id]) => {
			if (!id) return null;

			return await prisma.option.findMany({ where: { leaderboardId: id }, include: { _count: { select: { voteAgainst: true, voteFor: true } } } });
		},
		{ key: () => ['leaderboard-options', input.data.latest?.id] }
	);
}

function calcPercentage(voteFor: number, voteAgainst: number) {
	if (voteAgainst === 0) return 0;
	return (voteFor / (voteAgainst + voteFor)) * 100;
}

export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();
	const candidatesSorted = () => (data.latest ? [...data.latest] : []).sort((a, b) => calcPercentage(b._count.voteFor, b._count.voteAgainst) - calcPercentage(a._count.voteFor, a._count.voteAgainst)) ?? [];

	return (
		<div>
			<HttpHeader name="Cache-Control" value="s-maxage=600" />
			<Loading isLoading={data.loading} />
			{data.latest ? (
				<>
					<div class="mx-auto mt-6 flex w-full flex-col overflow-hidden rounded-md border-2 border-gray-500">
						<For each={candidatesSorted()}>
							{(option, i) => (
								<div class="flex h-24 w-full items-center gap-4 pr-3 hover:bg-black hover:bg-opacity-20">
									<div class="grid h-full w-24 place-items-center bg-slate-700 text-3xl">{i() + 1}</div>
									<img class="max-h-full w-28 object-contain" alt={option.content} src={option.image ?? ''} />
									<p class="text-lg">{option.content}</p>
									<p class="ml-auto text-lg">{calcPercentage(option._count.voteFor, option._count.voteAgainst).toPrecision(3)}%</p>
								</div>
							)}
						</For>
					</div>
					<div class="mt-8">
						<A href="./vote" class="rounded-md bg-red-500 py-2 px-4 hover:bg-red-600">
							Vote
						</A>
					</div>
				</>
			) : (
				'NOT FOUND'
			)}
		</div>
	);
}
