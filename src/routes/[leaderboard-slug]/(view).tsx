import { For } from 'solid-js';
import { RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { prisma } from '~/db';

export function routeData({ params }: RouteDataArgs) {
	return createServerData$(
		async ([, slug]) => {
			const leaderboard = await prisma.leaderboard.findUnique({ where: { slug }, include: { options: { include: { _count: { select: { voteAgainst: true, voteFor: true } } } } } });
			console.log('prisma request', { leaderboard });
			return leaderboard;
		},
		{ key: () => ['leaderboard', params['leaderboard-slug']] }
	);
}

function calcPercentage(voteFor: number, voteAgainst: number) {
	if (voteAgainst === 0) return 0;
	return (voteFor / voteAgainst) * 100;
}

export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();
	const candidatesSorted = () => data.latest?.options.sort((a, b) => calcPercentage(b._count.voteFor, b._count.voteAgainst) - calcPercentage(a._count.voteFor, a._count.voteAgainst)) ?? [];
	return (
		<main class="text-center">
			<div class="mx-auto flex max-w-5xl flex-col p-2 pt-14">
				{!data.latest ? (
					'NOT FOUND'
				) : (
					<>
						<h1 class="mt-12 text-3xl font-bold text-red-500 sm:text-4xl md:text-5xl">{data.latest.name}</h1>

						<span class="m-2 text-sm font-normal text-gray-300">#{data.latest.slug}</span>
						<h2 class="mt-6 text-xl font-bold">{data.latest.question}</h2>
						<div class="mx-auto mt-6 flex w-full flex-col overflow-hidden rounded-md border-2 border-gray-500">
							<For each={candidatesSorted()}>
								{(option, i) => (
									<div class="flex h-24 w-full items-center gap-4 pr-3 hover:bg-black hover:bg-opacity-20">
										<div class="grid h-full w-24 place-items-center bg-slate-700 text-3xl">{i() + 1}</div>
										<img class="w-28" src={option.image ?? ''} />
										<p class="text-lg">{option.content}</p>
										<p class="ml-auto text-lg">{calcPercentage(option._count.voteFor, option._count.voteAgainst).toPrecision(3)}%</p>
									</div>
								)}
							</For>
						</div>
					</>
				)}
			</div>
		</main>
	);
}
