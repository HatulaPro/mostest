import { AiFillStar } from 'solid-icons/ai';
import { type Component, For, Suspense, createEffect, Show } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { createServerAction$, createServerData$ } from 'solid-start/server';
import { prisma } from '~/db';
import { LeaderboardView, LeaderboardViewLoading } from './LeaderboardView';
import type { Leaderboard, Option } from '@prisma/client';
import { Loading } from './Loading';

export const TopLeaderboards: Component = () => {
	const data = createServerData$(async () => {
		return await prisma.leaderboard.findMany({ take: 3, include: { options: { take: 4, where: { image: { not: null } } } }, orderBy: { votes: { _count: 'desc' } } });
	});

	const [leaderboards, setLeaderboards] = createStore<
		(Leaderboard & {
			options: Option[];
		})[]
	>([]);

	createEffect(() => {
		const d = data();
		if (!d) return;
		setLeaderboards(reconcile(d, { key: 'id' }));
	});

	const [enrolling, enroll] = createServerAction$(
		async (cursor: string) => {
			return await prisma.leaderboard.findMany({ cursor: { id: cursor }, take: 3, skip: 1, include: { options: { take: 4, where: { image: { not: null } } } }, orderBy: { votes: { _count: 'desc' } } });
		},
		{ invalidate: ['nothing'] }
	);

	return (
		<div class="w-full overflow-hidden bg-black/30">
			<div class="w-full shrink-0 grow  p-4 sm:p-16 sm:py-4">
				<h2 class="mb-6 mt-4 text-2xl font-bold sm:mb-12 sm:text-4xl">
					<AiFillStar class="mb-2 inline-block fill-yellow-300 text-3xl sm:text-4xl md:text-5xl" /> Featured Leaderboards
				</h2>
				<div class="mx-auto grid max-w-5xl grid-cols-1 place-items-center gap-4 sm:grid-cols-3 sm:gap-8">
					<Suspense fallback={<For each={[1, 2, 3]}>{() => <LeaderboardViewLoading />}</For>}>
						<Show when={data()}>
							<For each={leaderboards.length ? leaderboards : data.latest}>{(leaderboard) => <LeaderboardView leaderboard={leaderboard} />}</For>
						</Show>
					</Suspense>
				</div>
				{(enrolling.result ? enrolling.result.length > 2 : true) && (
					<button
						disabled={enrolling.pending}
						onClick={() => {
							if (leaderboards.length) {
								enroll(leaderboards[leaderboards.length - 1].id).then((result) => {
									setLeaderboards(reconcile([...leaderboards, ...result], { key: 'id' }));
								});
							}
						}}
						class="group relative mx-auto mt-6 mb-2 flex items-center gap-3 text-white hover:underline"
					>
						<Loading isLoading={enrolling.pending} />
						More Leaderboards
					</button>
				)}
			</div>
		</div>
	);
};
