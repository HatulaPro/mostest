import { on } from 'solid-js';
import { createEffect, createSignal, For, Suspense } from 'solid-js';
import { type RouteDataArgs, A, useRouteData, refetchRouteData } from 'solid-start';
import { createServerAction$, createServerData$, ServerError } from 'solid-start/server';
import { z } from 'zod';
import { Loading } from '~/components/Loading';
import { prisma } from '~/db';
import { safeArg } from '~/utils/functions';
import { type routeData as ParentRouteData } from '../[leaderboard-slug]';

export function routeData(input: RouteDataArgs<typeof ParentRouteData>) {
	const optionsA = createServerData$(
		async ([, id]) => {
			if (!id) return null;
			const twoOptionsSchema = z.array(z.object({ id: z.string(), leaderboardId: z.string(), content: z.string(), image: z.string().optional() })).length(2);
			const res = await prisma.$queryRaw`SELECT "public"."Option"."id", "public"."Option"."leaderboardId", "public"."Option"."content", "public"."Option"."image" FROM "public"."Option" WHERE "public"."Option"."leaderboardId" = ${id} ORDER BY RANDOM() ASC LIMIT 2`;
			const parsed = twoOptionsSchema.safeParse(res);
			if (parsed.success) return parsed.data;
			return null;
		},
		{
			key: () => ['leaderboard-options', input.data.latest?.id, 'optionsA'],
		}
	);

	const optionsB = createServerData$(
		async ([, id]) => {
			if (!id) return null;
			const twoOptionsSchema = z.array(z.object({ id: z.string(), leaderboardId: z.string(), content: z.string(), image: z.string().optional() })).length(2);
			const res = await prisma.$queryRaw`SELECT "public"."Option"."id", "public"."Option"."leaderboardId", "public"."Option"."content", "public"."Option"."image" FROM "public"."Option" WHERE "public"."Option"."leaderboardId" = ${id} ORDER BY RANDOM() ASC LIMIT 2`;
			const parsed = twoOptionsSchema.safeParse(res);
			if (parsed.success) return parsed.data;
			return null;
		},
		{
			key: () => ['leaderboard-options', input.data.latest?.id, 'optionsB'],
		}
	);

	return { optionsA, optionsB };
}

export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();
	const [currentOptions, setCurrentOptions] = createSignal<keyof typeof data>('optionsA');
	const isLoading = () => data.optionsA.loading && data.optionsB.loading;

	// Prefetching images
	createEffect(() => {
		data.optionsA()?.forEach((value) => {
			if (value.image) {
				const preloaded = new Image();
				preloaded.src = value.image;
			}
		});
		data.optionsB()?.forEach((value) => {
			if (value.image) {
				const preloaded = new Image();
				preloaded.src = value.image;
			}
		});
	});
	const [, enroll] = createServerAction$(
		async (ids: { votedFor: string; votedAgainst: string }) => {
			if (ids.votedFor === ids.votedAgainst) throw new ServerError('Invalid option pair.');
			const [votedFor, votedAgainst] = await Promise.all([prisma.option.findUnique({ where: { id: ids.votedFor }, select: { id: true, leaderboardId: true } }), prisma.option.findUnique({ where: { id: ids.votedAgainst }, select: { id: true, leaderboardId: true } })]);
			if (!votedFor || !votedAgainst) throw new ServerError('Option not found.');
			if (votedFor.leaderboardId !== votedAgainst.leaderboardId) throw new ServerError('Invalid option pair.');

			return await prisma.vote.create({ data: { votedAgainstId: votedAgainst.id, votedForId: votedFor.id, leaderboardId: votedFor.leaderboardId } });
		},
		{
			// Using a made up key to ensure nothing is invalidated
			invalidate: ['nothing'],
		}
	);

	function voteFor(chosenOption: string) {
		const p = data[currentOptions()]();
		if (!p) return;
		const votedFor = p.find((o) => o.id === chosenOption);
		const votedAgainst = p.find((o) => o.id !== chosenOption);
		refetchRouteData(['leaderboard-options', p[0].leaderboardId, currentOptions()]);
		setCurrentOptions((c) => (c === 'optionsA' ? 'optionsB' : 'optionsA'));
		if (votedFor && votedAgainst) {
			enroll({ votedFor: votedFor.id, votedAgainst: votedAgainst.id });
		}
	}

	return (
		<div>
			<div class="mt-8 flex w-full justify-evenly gap-3">
				<Suspense
					fallback={
						<>
							<div class="flex h-48 w-48 animate-pulse flex-col items-center rounded-md border-2 border-gray-500 bg-slate-700 pb-6 sm:h-64 sm:w-64" />
							<div class="flex h-48 w-48 animate-pulse flex-col items-center rounded-md border-2 border-gray-500 bg-slate-700 pb-6 sm:h-64 sm:w-64" />
						</>
					}
				>
					<For each={data[currentOptions()]()}>
						{(option) => (
							<button
								ref={(el) =>
									// Adding animation on new id
									createEffect(
										on(
											() => data[currentOptions()](),
											() => {
												el.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 300, fill: 'forwards' });
											}
										)
									)
								}
								disabled={isLoading()}
								onClick={safeArg(voteFor, option.id)}
								type="button"
								class="group relative flex h-48 w-48 scale-0 flex-col items-center rounded-md border-2 border-gray-500 bg-transparent pb-6 sm:h-64 sm:w-64"
							>
								<img class="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 scale-0 opacity-0 blur-2xl transition-all group-hover:scale-75 group-hover:opacity-40 sm:h-80 sm:w-80 [@media(hover:none)]:hidden" src={option.image ?? ''} alt={option.content} />
								<img class="h-full w-full object-contain" src={option.image ?? ''} alt={option.content} />
								<p class="mt-auto">{option.content}</p>
							</button>
						)}
					</For>
				</Suspense>
			</div>
			<Loading isLoading={isLoading()} />
			<div class="mt-8">
				<A href=".." class="rounded-md bg-red-500 py-2 px-4 hover:bg-red-600">
					View Results
				</A>
			</div>
		</div>
	);
}
