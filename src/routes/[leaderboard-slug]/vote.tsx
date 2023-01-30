import { For } from 'solid-js';
import { A, RouteDataArgs, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, ServerError } from 'solid-start/server';
import { z } from 'zod';
import { Loading } from '~/components/Loading';
import { prisma } from '~/db';
import { type routeData as ParentRouteData } from '../[leaderboard-slug]';

export function routeData(input: RouteDataArgs<typeof ParentRouteData>) {
	return createServerData$(
		async ([, id]) => {
			if (!id) return null;
			const twoOptionsSchema = z.array(z.object({ id: z.string(), leaderboardId: z.string(), content: z.string(), image: z.string().optional() })).length(2);
			const res = await prisma.$queryRaw`SELECT "public"."Option"."id", "public"."Option"."leaderboardId", "public"."Option"."content", "public"."Option"."image" FROM "public"."Option" WHERE "public"."Option"."leaderboardId" = ${id} ORDER BY RANDOM() ASC LIMIT 2`;
			const parsed = twoOptionsSchema.safeParse(res);
			if (parsed.success) return parsed.data;
			return null;
		},
		{ key: () => ['leaderboard-options', input.data.latest?.id] }
	);
}

export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();

	const [enrolling, enroll] = createServerAction$(async (ids: { votedFor: string; votedAgainst: string }) => {
		if (ids.votedFor === ids.votedAgainst) throw new ServerError('Invalid option pair.');
		const [votedFor, votedAgainst] = await Promise.all([prisma.option.findUnique({ where: { id: ids.votedFor } }), prisma.option.findUnique({ where: { id: ids.votedAgainst } })]);
		if (!votedFor || !votedAgainst) throw new ServerError('Option not found.');
		if (votedFor.leaderboardId !== votedAgainst.leaderboardId) throw new ServerError('Invalid option pair.');

		return await prisma.vote.create({ data: { votedAgainstId: votedAgainst.id, votedForId: votedFor.id } });
	});
	function voteFor(chosenOption: number) {
		enroll({ votedFor: data.latest![chosenOption].id, votedAgainst: data.latest![chosenOption === 0 ? 1 : 0].id });
	}

	return (
		<div>
			{data.latest ? (
				<>
					<div class="mt-8 flex w-full justify-evenly gap-3">
						<For each={data.latest}>
							{(option, i) => (
								<button disabled={data.loading || enrolling.pending} onClick={[voteFor, i()]} type="button" class="group relative flex flex-col items-center rounded-md border-2 border-gray-500 bg-transparent transition-all disabled:scale-0 disabled:opacity-0">
									<img classList={{ 'opacity-0': enrolling.pending, 'opacity-40': !enrolling.pending }} class="absolute w-64 scale-0 blur-2xl transition-transform group-hover:scale-100 sm:w-80" src={option.image ?? ''} alt={option.content} />
									<img class="w-48 sm:w-64" src={option.image ?? ''} alt={option.content} />
									<p class="mt-auto">{option.content}</p>
								</button>
							)}
						</For>
					</div>
					<Loading isLoading={data.loading || enrolling.pending} />
					<div class="mt-8">
						<A href=".." class="rounded-md bg-red-500 py-2 px-4 hover:bg-red-600">
							View Results
						</A>
					</div>
				</>
			) : (
				<>Error: Could not load candidates</>
			)}
		</div>
	);
}
