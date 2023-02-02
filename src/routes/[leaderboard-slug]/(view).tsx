import { A, useSearchParams } from '@solidjs/router';
import { AiOutlineEdit } from 'solid-icons/ai';
import { For, Suspense } from 'solid-js';
import { type RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { Loading } from '~/components/Loading';
import { ShareButton } from '~/components/ShareButton';
import { prisma } from '~/db';
import { range } from '~/utils/functions';
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
	if (voteAgainst + voteFor === 0) return 0;
	if (voteFor !== 0 && voteAgainst === 0) return 100;
	return (voteFor / (voteAgainst + voteFor)) * 100;
}

const PAGE_SIZE = 10;
export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();
	const candidatesSorted = () =>
		data()
			?.options.slice()
			.sort((a, b) => calcPercentage(b._count.voteFor, b._count.voteAgainst) - calcPercentage(a._count.voteFor, a._count.voteAgainst));

	const [searchParams, setSearchParams] = useSearchParams<{ page: string }>();
	const page = () => parseInt(searchParams.page) || 1;
	const setPage = (n: number) => setSearchParams({ ...searchParams, page: `${n}` });
	const pageCount = () => Math.ceil((data()?.options.length ?? PAGE_SIZE) / PAGE_SIZE);

	return (
		<div>
			<Suspense>
				<div class="mb-1 mt-6 flex w-full items-end justify-center text-left text-xs sm:text-sm">
					<span class="hidden text-xs text-gray-300 sm:block">
						Showing page {page()} of {pageCount()}
					</span>
					<div class="flex gap-1 sm:ml-auto sm:gap-2">
						{page() > 2 && (
							<>
								<For each={range(1, Math.min(3, page() - 1))}>
									{(num) => (
										<button onClick={() => setPage(num)} classList={{ 'rounded-md px-2 sm:px-3 py-1.5 transition-colors': true, 'bg-slate-500 hover:bg-slate-600': page() !== num, 'bg-red-500 hover:bg-red-600': page() === num }}>
											{num}
										</button>
									)}
								</For>
								{page() > 4 && <span class="self-end">...</span>}
							</>
						)}
						<For each={range(Math.max(1, page() - 1), Math.min(pageCount() + 1, page() + 2))}>
							{(num) => (
								<button onClick={() => setPage(num)} classList={{ 'rounded-md px-2 sm:px-3 py-1.5 transition-colors': true, 'bg-slate-500 hover:bg-slate-600': page() !== num, 'bg-red-500 hover:bg-red-600': page() === num }}>
									{num}
								</button>
							)}
						</For>
						{page() < pageCount() - 1 && (
							<>
								{page() !== pageCount() - 2 && <span class="self-end">...</span>}
								<For each={range(Math.max(page() + 2, pageCount() - 1), pageCount() + 1)}>
									{(num) => (
										<button onClick={() => setPage(num)} classList={{ 'rounded-md px-2 sm:px-3 py-1.5 transition-colors': true, 'bg-slate-500 hover:bg-slate-600': page() !== num, 'bg-red-500 hover:bg-red-600': page() === num }}>
											{num}
										</button>
									)}
								</For>
							</>
						)}
					</div>
				</div>
			</Suspense>
			<div class="mx-auto mb-2 flex w-full flex-col overflow-hidden rounded-md border-2 border-gray-500">
				<Suspense
					fallback={
						<For each={[1, 2, 3]}>
							{(i) => (
								<div class="grid h-24 w-full grid-cols-[1fr_2fr_2fr] items-center gap-2 pr-1 hover:bg-black hover:bg-opacity-20 sm:grid-cols-[6rem_3fr_3fr] sm:pr-3">
									<div class="grid h-full place-items-center border-r-2 border-gray-500 text-xl">{i}</div>
									<div class="flex h-[inherit] items-center gap-2">
										<div class="h-full animate-pulse bg-slate-700 object-contain py-1"></div>
										<p class="animate-pulse bg-slate-700 text-center text-xs text-transparent sm:text-lg">SOME TEXT HERE</p>
									</div>
									<p class="ml-auto animate-pulse bg-slate-700 text-xs text-transparent sm:text-lg">99.99%</p>
								</div>
							)}
						</For>
					}
				>
					<For each={candidatesSorted()?.slice(PAGE_SIZE * (page() - 1), PAGE_SIZE * page())}>
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
				</Suspense>
			</div>
			<Loading isLoading={data.loading} />
			<div class="mt-8 flex justify-center gap-2">
				<A href="./vote" class="rounded-md bg-red-500 py-2 px-4 hover:bg-red-600">
					Vote
				</A>
				<Suspense fallback={<ShareButton text="" title="" url={document.location.href} disabled />}>
					{data.latest?.leaderboard && <ShareButton text={`Vote on ${data.latest.leaderboard.name}: ${data.latest.leaderboard.question}`} title={data.latest.leaderboard.name} url={document.location.href} />}
					{data.latest?.leaderboard?.ownerId && data.latest.leaderboard.ownerId === data.latest.user?.id && (
						<A href="./edit" class="flex items-center rounded-md bg-slate-700 py-2 px-3 text-white hover:bg-slate-700 disabled:contrast-75">
							<AiOutlineEdit class="mr-2 text-xl" />
							Edit
						</A>
					)}
				</Suspense>
			</div>
		</div>
	);
}
