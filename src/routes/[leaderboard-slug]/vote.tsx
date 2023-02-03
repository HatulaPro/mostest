import { useNavigate } from '@solidjs/router';
import { createEffect, For, Suspense } from 'solid-js';
import { type RouteDataArgs, A, useRouteData, refetchRouteData } from 'solid-start';
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

	const [, enroll] = createServerAction$(
		async (ids: { votedFor: string; votedAgainst: string }) => {
			if (ids.votedFor === ids.votedAgainst) throw new ServerError('Invalid option pair.');
			const [votedFor, votedAgainst] = await Promise.all([prisma.option.findUnique({ where: { id: ids.votedFor }, select: { id: true, leaderboardId: true } }), prisma.option.findUnique({ where: { id: ids.votedAgainst }, select: { id: true, leaderboardId: true } })]);
			if (!votedFor || !votedAgainst) throw new ServerError('Option not found.');
			if (votedFor.leaderboardId !== votedAgainst.leaderboardId) throw new ServerError('Invalid option pair.');

			return await prisma.vote.create({ data: { votedAgainstId: votedAgainst.id, votedForId: votedFor.id } });
		},
		{
			invalidate: () => [],
		}
	);

	function voteFor(chosenOption: number) {
		if (!data.latest) return;
		refetchRouteData(['leaderboard-options', data.latest[chosenOption].leaderboardId]);

		enroll({ votedFor: data.latest[chosenOption].id, votedAgainst: data.latest[chosenOption === 0 ? 1 : 0].id });
	}

	const navigate = useNavigate();
	createEffect(() => {
		const twoOptionsSchema = z.array(z.object({ id: z.string(), leaderboardId: z.string(), content: z.string(), image: z.string().optional() })).length(2);

		if (data.latest && twoOptionsSchema.safeParse(data.latest).success === false) {
			navigate('/blocked');
		}
	});
	return (
		<div>
			<div class="mt-8 flex w-full justify-evenly gap-3">
				<Suspense
					fallback={
						<>
							<div class="flex animate-pulse flex-col items-center rounded-md border-2 border-gray-500 bg-slate-700">
								<div class="h-48 w-48 sm:h-64 sm:w-64"></div>
								<p class="mt-auto h-6"></p>
							</div>
							<div class="flex animate-pulse flex-col items-center rounded-md border-2 border-gray-500 bg-slate-700">
								<div class="h-48 w-48 sm:h-64 sm:w-64"></div>
								<p class="mt-auto h-6"></p>
							</div>
						</>
					}
				>
					<>
						<For each={data.latest?.slice(0, 2)}>
							{(option, i) => (
								<button disabled={data.loading} onClick={[voteFor, i()]} type="button" class="group relative flex flex-col items-center rounded-md border-2 border-gray-500 bg-transparent transition-all disabled:scale-0 disabled:opacity-0">
									<img class="absolute w-64 scale-0 opacity-40 blur-2xl transition-transform group-hover:scale-100 sm:w-80" src={option.image ?? ''} alt={option.content} />
									<img class="h-48 w-48 object-contain sm:h-64 sm:w-64" src={option.image ?? ''} alt={option.content} />
									<p class="mt-auto">{option.content}</p>
								</button>
							)}
						</For>
					</>
				</Suspense>
			</div>
			<Loading isLoading={data.loading} />
			<div class="mt-8">
				<A href=".." class="rounded-md bg-red-500 py-2 px-4 hover:bg-red-600">
					View Results
				</A>
			</div>
		</div>
	);
}
