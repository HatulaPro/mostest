import { AiFillStar } from 'solid-icons/ai';
import { type Component, createSignal, For, Suspense } from 'solid-js';
import { A, Head, Meta, Title } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { TransitionGroup } from 'solid-transition-group';
import { CreateLeaderboardForm } from '~/components/CreateLeaderboardForm';
import { prisma } from '~/db';
import { safeArg } from '~/utils/functions';

export default function Home() {
	const [newLeaderboardName, setNewLeaderboardName] = createSignal('');
	let createLeaderboardFormRef: HTMLFormElement | undefined;
	return (
		<>
			<Head>
				<Title>Mostest | Build your leaderboard</Title>
				<Meta name="description" content="Build your community driven leaderboard on Mostest. " />
			</Head>
			<main class="text-center">
				<div class="mx-auto flex h-screen max-w-5xl flex-col justify-evenly p-2 pt-14">
					<div class="m-auto flex flex-col justify-center px-2">
						<h1 class="mb-4 text-3xl sm:text-4xl md:mb-8 md:text-5xl">
							Turn <span class="font-bold text-red-500">Ideas</span> into <span class="font-bold text-red-500">Leaderboards</span>!
						</h1>
						<p class="hidden text-xl font-bold md:block">Let us turn your leaderboard game idea into reality</p>
						<form
							class="text-md mx-auto mt-8 flex w-full justify-between rounded-full bg-gray-200 p-2 md:w-2/3 md:text-xl"
							onSubmit={(e) => {
								e.preventDefault();
								createLeaderboardFormRef?.scrollIntoView({ behavior: 'smooth' });
							}}
						>
							<input value={newLeaderboardName()} onChange={(e) => setNewLeaderboardName(e.currentTarget.value)} class="text-md flex-1 rounded-full bg-gray-200 pl-3 text-black outline-none md:text-xl" type="text" placeholder="What interests you?" />
							<button type="submit" class="rounded-full bg-red-500 py-1.5 px-4 transition-colors hover:bg-red-600 md:py-3 md:px-6">
								Create
							</button>
						</form>
					</div>
					<Minigame />
				</div>
				<div class="my-12 grid w-full place-items-center">
					<TopLeaderboards />
				</div>
				<div class="grid min-h-screen w-full place-items-center bg-gradient-to-b from-transparent via-black/30 to-black/30">
					<CreateLeaderboardForm name={newLeaderboardName()} ref={createLeaderboardFormRef} />
				</div>
			</main>
		</>
	);
}

const Minigame: Component = () => {
	const [leaderboard, setLeaderboard] = createSignal<Record<string, number>>({ 'Pizza 🍕': 0, 'Cake 🍰': 0 });
	const ordered = () => {
		const leads = leaderboard();
		return [...Object.keys(leaderboard())].sort((k1, k2) => leads[k2] - leads[k1]);
	};

	function voteFor(name: string) {
		setLeaderboard((prev) => {
			prev[name]++;
			return { ...prev };
		});
	}

	return (
		<div class="relative mx-auto my-auto w-full md:w-1/2">
			<h2 class="py-3 text-lg">Which one is better?</h2>
			<div class="flex w-full justify-center gap-4">
				<div class="flex-1 rounded-md border-2 border-gray-500 p-2">
					<TransitionGroup name="animated-y-list-item">
						<For each={ordered()}>
							{(k, i) => (
								<div class="animated-y-list-item flex items-center gap-1 border-b-2 border-gray-600 p-2 text-left last:border-b-0">
									<strong>{i() + 1}</strong>. {k} <span class="text-xs text-gray-300">({leaderboard()[k]} votes)</span>
									<button class="ml-auto rounded-md bg-red-500 px-4 py-1.5" onClick={safeArg(voteFor, k)}>
										Vote
									</button>
								</div>
							)}
						</For>
					</TransitionGroup>
				</div>
			</div>
		</div>
	);
};

const TopLeaderboards: Component = () => {
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
