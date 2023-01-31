import { A } from '@solidjs/router';
import { AiOutlineEdit } from 'solid-icons/ai';
import { For } from 'solid-js';
import { type RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { Loading } from '~/components/Loading';
import { ShareButton } from '~/components/ShareButton';
import { prisma } from '~/db';
import { getSession } from '../api/auth/[...solidauth]';
import { type routeData as ParentRouteData } from '../[leaderboard-slug]';

export function routeData(input: RouteDataArgs<typeof ParentRouteData>) {
	return createServerData$(
		async ([, id, latest], { request }) => {
			if (!id) return null;
			const [session, options] = await Promise.all([getSession(request), prisma.option.findMany({ where: { leaderboardId: id }, include: { _count: { select: { voteAgainst: true, voteFor: true } } } })]);

			return { leaderboard: latest, user: session?.user, options };
		},
		{ key: () => ['leaderboard-options', input.data.latest?.id, input.data.latest] as const }
	);
}

function calcPercentage(voteFor: number, voteAgainst: number) {
	if (voteAgainst === 0) return 0;
	return (voteFor / (voteAgainst + voteFor)) * 100;
}

export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();
	const candidatesSorted = () => (data.latest ? [...data.latest.options] : []).sort((a, b) => calcPercentage(b._count.voteFor, b._count.voteAgainst) - calcPercentage(a._count.voteFor, a._count.voteAgainst)) ?? [];

	return (
		<div>
			<Loading isLoading={data.loading} />
			{data.latest && (
				<>
					<div class="mx-auto mt-6 flex w-full flex-col overflow-hidden rounded-md border-2 border-gray-500">
						<For each={candidatesSorted()}>
							{(option, i) => (
								<div class="grid h-24 w-full grid-cols-[1fr_2fr_2fr] items-center gap-2 pr-1 hover:bg-black hover:bg-opacity-20 sm:grid-cols-[6rem_3fr_3fr] sm:pr-3">
									<div class="grid h-full place-items-center border-r-2 border-gray-500 text-xl">{i() + 1}</div>
									<div class="flex h-[inherit] items-center gap-2">
										<img class="h-full object-contain py-1" alt={option.content} src={option.image ?? ''} />
										<p class="text-center text-xs sm:text-lg">{option.content}</p>
									</div>
									<p class="ml-auto text-xs sm:text-lg">{calcPercentage(option._count.voteFor, option._count.voteAgainst).toPrecision(3)}%</p>
								</div>
							)}
						</For>
					</div>
					<div class="mt-8 flex justify-center gap-2">
						<A href="./vote" class="rounded-md bg-red-500 py-2 px-4 hover:bg-red-600">
							Vote
						</A>
						{data.latest.leaderboard && <ShareButton text={`Vote on ${data.latest.leaderboard.name}: ${data.latest.leaderboard.question}`} title={data.latest.leaderboard.name} url={document.location.href} />}
						{data.latest.leaderboard?.ownerId && data.latest.leaderboard.ownerId === data.latest.user?.id && (
							<A href="./edit" class="flex items-center rounded-md bg-slate-700 py-2 px-3 text-white hover:bg-slate-700 disabled:contrast-75">
								<AiOutlineEdit class="mr-2 text-xl" />
								Edit
							</A>
						)}
					</div>
				</>
			)}
		</div>
	);
}
