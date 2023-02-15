import type { Leaderboard, Option } from '@prisma/client';
import { useNavigate } from '@solidjs/router';
import { type Component, createSignal, For, lazy, createEffect } from 'solid-js';
import { createStore, reconcile, unwrap } from 'solid-js/store';
import { A, Head, Meta, Title } from 'solid-start';
import { createServerAction$ } from 'solid-start/server';
import { InfoSection } from '~/components/InfoSection';
import { Loading } from '~/components/Loading';
import { Minigame } from '~/components/MiniGame';
import { TopLeaderboards } from '~/components/TopLeaderboards';
import { Tweets } from '~/components/Tweets';
import { prisma } from '~/db';

const TransitionGroup = lazy(async () => ({ default: (await import('solid-transition-group')).TransitionGroup }));

export default function Home() {
	return (
		<>
			<Head>
				<Title>Mostest | Build your leaderboard</Title>
				<Meta name="description" content="Build your community driven leaderboard on Mostest. " />
			</Head>
			<main class="text-center">
				<div class="mx-auto flex min-h-screen max-w-5xl flex-col p-2 pt-14">
					<SearchLeaderboards />
					<Minigame />
				</div>
				<div class="my-20 grid w-full place-items-center">
					<TopLeaderboards />
				</div>
				<div class="my-20 grid w-full place-items-center">
					<Tweets />
				</div>
				<div class="my-20 grid w-full place-items-center">
					<InfoSection />
				</div>
			</main>
		</>
	);
}

const SearchLeaderboards: Component = () => {
	const [newLeaderboardName, setNewLeaderboardName] = createSignal('');
	const navigate = useNavigate();

	const [enrolling, enroll] = createServerAction$(async (query: string) => {
		if (typeof query !== 'string') return [];
		const q = query.trim(); //.toLowerCase().trim();
		const leaderboards = await prisma.leaderboard.findMany({ take: 6, include: { options: { take: 4 } }, where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }, { question: { contains: q, mode: 'insensitive' } }] } });
		return leaderboards;
	});

	const [results, setResults] = createStore<
		(Leaderboard & {
			options: Option[];
		})[]
	>([]);

	createEffect(() => {
		if (enrolling.result) {
			setResults(reconcile([...unwrap(enrolling.result)], { key: 'slug' }));
		}
	});

	return (
		<>
			<div class="mx-auto mt-16 flex flex-col justify-center px-2">
				<h1 class="mb-4 text-3xl sm:text-4xl md:mb-8 md:text-5xl">
					Turn <span class="font-bold text-red-500">Ideas</span> into <span class="font-bold text-red-500">Leaderboards</span>!
				</h1>
				<p class="hidden text-xl font-bold md:block">Let us turn your leaderboard game idea into reality</p>
				<form
					class="relative text-md mx-auto mt-8 flex w-full justify-between rounded-full bg-gray-200 p-2 md:w-2/3 md:text-xl"
					onSubmit={(e) => {
						e.preventDefault();
						const params = new URLSearchParams({ name: newLeaderboardName() });
						navigate(`/create?${params}`);
					}}
				>
					<div class="absolute -left-8 top-1/2 -translate-y-1/2">
						<Loading isLoading={enrolling.pending} />
					</div>
					<input
						value={newLeaderboardName()}
						onInput={(e) => {
							setNewLeaderboardName(e.currentTarget.value);
							if (e.currentTarget.value.length > 0) {
								enroll(e.currentTarget.value);
							} else {
								enrolling.clear();
								setResults([]);
							}
						}}
						class="text-md flex-1 rounded-full bg-gray-200 pl-3 text-black outline-none md:text-xl"
						type="text"
						placeholder="What interests you?"
					/>
					<button type="submit" class="rounded-full bg-red-500 py-1.5 px-4 transition-colors hover:bg-red-600 md:py-3 md:px-6">
						Create
					</button>
				</form>
			</div>
			<div class="my-4 overflow-hidden text-left">
				<div class="justify-left scrollbar flex h-32 w-full gap-4 overflow-x-scroll">
					<TransitionGroup name="animated-x-list-item">
						{results.length ? (
							<For each={results}>
								{(leaderboard) => (
									<div class="animated-x-list-item flex h-28 shrink-0 grow flex-col items-start gap-2 rounded-md border-2 border-gray-700 p-3 hover:bg-black hover:bg-opacity-20">
										<A href={`/${leaderboard.slug}`} class="text-lg font-bold hover:underline ">
											{leaderboard.name} <span class="text-base font-normal text-gray-300">{leaderboard.question}</span>
										</A>
										<div class="flex h-8 gap-2">
											<For each={leaderboard.options.filter((x) => typeof x.image === 'string')}>{(option) => <img class="h-full object-contain" src={option.image ?? ''} />}</For>
										</div>
									</div>
								)}
							</For>
						) : (
							[]
						)}
					</TransitionGroup>
				</div>
			</div>
		</>
	);
};
