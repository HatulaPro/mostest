import { AiFillStar } from 'solid-icons/ai';
import { type Component, For, Suspense } from 'solid-js';
import { createServerData$ } from 'solid-start/server';
import { prisma } from '~/db';
import { LeaderboardView, LeaderboardViewLoading } from './LeaderboardView';

export const TopLeaderboards: Component = () => {
	const data = createServerData$(async () => {
		return await prisma.leaderboard.findMany({ take: 3, include: { options: { take: 4, where: { image: { not: null } } } }, orderBy: { votes: { _count: 'desc' } } });
	});

	return (
		<div class="w-full overflow-hidden bg-black/30">
			<div class="w-full shrink-0 grow  p-4 sm:p-16 sm:py-4">
				<h2 class="mb-6 mt-4 text-2xl font-bold sm:mb-12 sm:text-4xl">
					<AiFillStar class="mb-2 inline-block fill-yellow-300 text-3xl sm:text-4xl md:text-5xl" /> Featured Leaderboards
				</h2>
				<div class="mx-auto grid max-w-5xl grid-cols-1 place-items-center gap-4 sm:grid-cols-3 sm:gap-8">
					<Suspense fallback={<For each={[1, 2, 3]}>{() => <LeaderboardViewLoading />}</For>}>
						<For each={data.latest}>{(leaderboard) => <LeaderboardView leaderboard={leaderboard} />}</For>
					</Suspense>
				</div>
				<button class="group relative mt-6 mb-2 inline-block text-white hover:underline">More Leaderboards</button>
			</div>
		</div>
	);
};
