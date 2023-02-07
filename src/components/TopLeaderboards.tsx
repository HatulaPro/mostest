import { AiFillStar } from 'solid-icons/ai';
import { type Component, For, Suspense } from 'solid-js';
import { A } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { prisma } from '~/db';

export const TopLeaderboards: Component = () => {
	const data = createServerData$(async () => {
		return await prisma.leaderboard.findMany({ take: 3, include: { options: { take: 4, where: { image: { not: null } } } }, orderBy: { votes: { _count: 'desc' } } });
	});

	return (
		<div class="w-full bg-black/30 p-4 sm:p-16 sm:pt-4">
			<h2 class="mb-6 mt-4 text-2xl font-bold sm:mb-12 sm:text-4xl">
				<AiFillStar class="mb-2 inline-block fill-yellow-300 text-3xl sm:text-4xl md:text-5xl" /> Featured Leaderboards
			</h2>
			<div class="mx-auto grid max-w-5xl grid-cols-1 place-items-center gap-4 sm:grid-cols-3 sm:gap-8">
				<Suspense
					fallback={
						<For each={[1, 2, 3]}>
							{() => (
								<div class="flex h-full w-full flex-col gap-2 rounded-md bg-slate-800 p-3 pb-2 text-left sm:gap-4 sm:p-6">
									<h3 class="animate-pulse bg-slate-700 text-lg text-transparent sm:text-2xl">Leaderboard Name</h3>
									<span class="animate-pulse bg-slate-700 text-base text-transparent sm:text-lg">Leaderboard Question</span>
									<div class="mt-auto">
										<div class="flex justify-start gap-1">
											<For each={[1, 2, 3, 4]}>{() => <div class="h-8 w-8 animate-pulse bg-slate-700" />}</For>
										</div>
										<button class="mx-auto mt-2 block w-min rounded-md bg-red-500 px-4 py-1.5 text-sm hover:bg-red-600 sm:mt-4 sm:text-base">Vote</button>
									</div>
								</div>
							)}
						</For>
					}
				>
					<For each={data.latest}>
						{(leaderboard) => (
							<div class="flex h-full w-full flex-col gap-2 rounded-md bg-slate-800 p-3 pb-2 text-left sm:gap-4 sm:p-6">
								<A href={`/${leaderboard.slug}`} class="hover:underline">
									<h3 class="text-lg sm:text-2xl">{leaderboard.name}</h3>
								</A>
								<span class="text-base sm:text-lg">{leaderboard.question}</span>
								<div class="mt-auto">
									<div class="flex justify-start gap-1">
										<For each={leaderboard.options}>{(option) => <img src={option.image ?? ''} class="h-8 w-8" alt={option.content} />}</For>
									</div>
									<A href={`/${leaderboard.slug}/vote`} class="mx-auto mt-2 block w-min rounded-md bg-red-500 px-4 py-1.5 text-sm hover:bg-red-600 sm:mt-4 sm:text-base">
										Vote
									</A>
								</div>
							</div>
						)}
					</For>
				</Suspense>
			</div>
		</div>
	);
};
