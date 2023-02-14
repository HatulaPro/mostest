import { A, useSearchParams } from '@solidjs/router';
import { AiOutlineEdit, AiOutlineSearch } from 'solid-icons/ai';
import { type Component, createEffect, createSignal, For, Match, Suspense, Switch } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import { type RouteDataArgs, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { TransitionGroup } from 'solid-transition-group';
import { EditCandidateForm } from '~/components/EditCandidateForm';
import { Pagination } from '~/components/Pagination';
import { ShareButton } from '~/components/ShareButton';
import { prisma } from '~/db';
import { getSession } from '../api/auth/[...solidauth]';
import { type routeData as ParentRouteData } from '../[leaderboard-slug]';

export function routeData(input: RouteDataArgs<typeof ParentRouteData>) {
	return createServerData$(
		async ([, id, latest], { request }) => {
			if (!id) return null;
			const [session, options] = await Promise.all([getSession(request), prisma.option.findMany({ where: { leaderboardId: id }, include: { _count: { select: { voteAgainst: true, voteFor: true } } } })]);

			return { leaderboard: latest, user: session?.user, options: options.map((o) => [o.id, o.image, o.content, o.leaderboardId, o._count.voteFor, o._count.voteAgainst] as const) };
		},
		{ key: () => ['leaderboard-options', input.data.latest?.id, input.data.latest] as const }
	);
}

function calcPercentage(voteFor: number, voteAgainst: number) {
	if (voteAgainst + voteFor === 0) return 0;
	if (voteFor !== 0 && voteAgainst === 0) return 100;
	return (voteFor / (voteAgainst + voteFor)) * 100;
}

const PAGE_SIZE = 8;
export default function ViewLeaderboard() {
	const data = useRouteData<typeof routeData>();

	const [searchParams, setSearchParams] = useSearchParams<{ page: string; query: string }>();
	const page = () => parseInt(searchParams.page) || 1;
	const setPage = (n: number) => setSearchParams({ ...searchParams, page: `${n}` });

	const query = () => searchParams.query || '';
	const setQuery = (s: string) => setSearchParams({ ...searchParams, query: s });

	const candidatesSorted = () =>
		data()
			?.options.map((o) => ({ id: o[0], image: o[1], content: o[2], leaderboardId: o[3], _count: { voteFor: o[4], voteAgainst: o[5] } }))
			.sort((a, b) => {
				const diff = calcPercentage(b._count.voteFor, b._count.voteAgainst) - calcPercentage(a._count.voteFor, a._count.voteAgainst);
				if (diff !== 0) return diff;
				return a.id.localeCompare(b.id);
			});

	const [activeCandidates, setActiveCandidates] = createStore(
		candidatesSorted()
			?.map((value, index) => ({ value, index }))
			.filter(({ value }) => JSON.stringify(value).toLowerCase().includes(query().toLowerCase())) ?? []
	);
	createEffect(() => {
		if (query()) {
			const nexts = candidatesSorted()
				?.map((value, index) => ({ value, index }))
				.filter(({ value }) => value.content.toLowerCase().includes(query().toLowerCase()));
			if (!nexts) return setActiveCandidates([]);
			setActiveCandidates(reconcile(nexts, { key: 'index' }));
			return;
		}
		const nexts = candidatesSorted()?.map((value, index) => ({ value, index }));
		if (!nexts) return setActiveCandidates([]);
		setActiveCandidates(reconcile(nexts, { key: 'index' }));
	});

	const pageCount = () => Math.ceil((activeCandidates.length || PAGE_SIZE) / PAGE_SIZE);
	const isOwner = () => data.latest?.leaderboard?.ownerId && data.latest.leaderboard.ownerId === data.latest.user?.id;
	const [editedId, setEditedId] = createSignal<number>(-1);

	const preloadPageImages = (p: number) => {
		activeCandidates.slice(PAGE_SIZE * (p - 1), PAGE_SIZE * p).forEach((c) => {
			if (c.value.image) {
				const img = new Image();
				img.src = c.value.image;
			}
		});
	};

	const close = () => setEditedId(-1);

	createEffect(() => {
		if (page() > pageCount()) {
			setPage(pageCount());
		}
	});

	return (
		<div class="pt-6">
			<Suspense>
				<Pagination page={page()} setPage={setPage} pageCount={pageCount()} preloader={preloadPageImages} isLoading={data.loading} isEmpty={activeCandidates.length === 0} />
			</Suspense>
			<div class="my-2 flex w-full items-center rounded-md border-2 border-gray-500 bg-gray-800 p-2 text-white transition-colors group-focus:border-gray-200">
				<input class="w-full bg-transparent text-white outline-none" type="text" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} placeholder="Search" />
				<AiOutlineSearch class="text-xl" />
			</div>
			<Suspense
				fallback={
					<div class="mx-auto mb-2 flex w-full flex-col overflow-hidden rounded-md border-2 border-gray-500">
						<For each={[1, 2, 3]}>
							{(i) => (
								<div class="grid h-24 w-full grid-cols-[1fr_2fr_2fr] items-center gap-2 pr-1 hover:bg-black hover:bg-opacity-20 sm:grid-cols-[6rem_3fr_3fr] sm:pr-3">
									<div class="grid h-full place-items-center border-r-2 border-gray-500 text-xl">
										<ImageOfIndex index={PAGE_SIZE * (page() - 1) + i - 1} />
									</div>
									<div class="flex h-[inherit] items-center gap-2">
										<div class="h-full animate-pulse bg-slate-700 object-contain py-1" />
										<p class="animate-pulse bg-slate-700 text-center text-xs text-transparent sm:text-lg">SOME TEXT HERE</p>
									</div>
									<p class="ml-auto animate-pulse bg-slate-700 text-xs text-transparent sm:text-lg">99.99%</p>
								</div>
							)}
						</For>
					</div>
				}
			>
				<div class="mx-auto mb-2 flex w-full flex-col overflow-hidden rounded-md border-2" classList={{ 'border-gray-500': activeCandidates.length !== 0, 'border-transparent': activeCandidates.length === 0 }}>
					{data() && (
						<TransitionGroup
							onEnter={(el, done) => {
								const anim = el.animate(
									[
										{ opacity: 0, transform: 'translateY(-100%)' },
										{ opacity: 1, transform: 'translateY(0%)' },
									],
									{ duration: 200, fill: 'forwards' }
								);
								anim.finished.then(done);
							}}
							onExit={(el, done) => {
								const anim = el.animate(
									[
										{ opacity: 1, transform: 'translateY(0%)' },
										{ opacity: 0, transform: 'translateY(100%)' },
									],
									{ duration: 200, fill: 'forwards' }
								);
								anim.finished.then(done);
							}}
						>
							{activeCandidates.length ? (
								<For each={activeCandidates.slice(PAGE_SIZE * (page() - 1), PAGE_SIZE * page())}>
									{(option) => (
										<div class="grid h-24 w-full grid-cols-[1fr_2fr_2fr] items-center gap-2 pr-1 hover:bg-black hover:bg-opacity-20 sm:grid-cols-[6rem_3fr_3fr] sm:pr-3">
											<div class="grid h-full place-items-center border-r-2 border-gray-500 text-xl">
												<ImageOfIndex index={option.index} />
											</div>
											<div class="flex h-[inherit] items-center gap-2">
												<img class="h-full object-contain py-1" alt={option.value.content} src={option.value.image ?? ''} />
												<p class="text-center text-xs sm:text-lg">{option.value.content}</p>
												{isOwner() && (
													<button onClick={() => setEditedId(option.index)} class="flex items-center rounded-md py-1.5 px-2 text-lg text-white transition-colors hover:bg-slate-800">
														<AiOutlineEdit />
													</button>
												)}
											</div>
											<p class="ml-auto text-xs sm:text-lg">{calcPercentage(option.value._count.voteFor, option.value._count.voteAgainst).toPrecision(3)}%</p>
										</div>
									)}
								</For>
							) : (
								[]
							)}
						</TransitionGroup>
					)}
				</div>
			</Suspense>
			<div class="mt-8 flex justify-center gap-2">
				<A href="./vote" class="rounded-md bg-red-500 py-2 px-4 hover:bg-red-600">
					Vote
				</A>
				<Suspense fallback={<ShareButton text="" title="" url={document.location.href} disabled />}>
					<>
						{data.latest?.leaderboard && <ShareButton text={`Vote on ${data.latest.leaderboard.name}: ${data.latest.leaderboard.question}`} title={data.latest.leaderboard.name} url={document.location.href} />}
						{isOwner() && (
							<button onClick={() => setEditedId(-2)} class="rounded-md bg-slate-700 py-2 px-3 text-white transition-colors hover:bg-slate-600">
								Create
							</button>
						)}
					</>
				</Suspense>
			</div>
			<Suspense>{isOwner() && <EditCandidateForm isOpen={editedId() !== -1} close={() => close} leaderboardId={data.latest?.leaderboard?.id ?? ''} create={editedId() === -2} candidate={(candidatesSorted() ?? [])[editedId()]} />}</Suspense>
		</div>
	);
}

const ImageOfIndex: Component<{ index: number }> = (props) => {
	return (
		<Switch fallback={<span>{props.index + 1}</span>}>
			<Match when={props.index === 0}>
				<img class="h-10" src="/cups/GoldCup2.svg" alt="Gold Cup" />
			</Match>
			<Match when={props.index === 1}>
				<img class="h-10" src="/cups/SilverCup2.svg" alt="Silver Cup" />
			</Match>
			<Match when={props.index === 2}>
				<img class="h-10" src="/cups/BronzeCup2.svg" alt="Bronze Cup" />
			</Match>
		</Switch>
	);
};
