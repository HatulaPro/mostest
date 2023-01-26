import { Component, createSignal, For, createRoot, createMemo, onCleanup, untrack } from 'solid-js';
import { TransitionGroup } from 'solid-transition-group';

export default function Home() {
	return (
		<>
			<main class="relative mx-auto max-w-5xl p-2 text-center">
				<div class="mx-auto flex h-[50vh] flex-col justify-center">
					<h1 class="mb-8 text-5xl">
						Turn <span class="font-bold text-red-500">Ideas</span> into <span class="font-bold text-red-500">Leaderboards</span>!
					</h1>
					<p class="text-xl font-bold">Let us turn your leaderboard game idea into reality</p>
					<div class="mx-auto mt-8 flex w-1/2 justify-between rounded-full bg-gray-200 p-2 text-xl">
						<input class="flex-1 rounded-full bg-gray-200 pl-3 text-xl text-black outline-none" type="text" placeholder="What interests you?" />
						<button class="rounded-full bg-red-500 py-3 px-6 transition-colors hover:bg-red-600" type="button">
							Create
						</button>
					</div>
				</div>
				<Minigame />
			</main>
		</>
	);
}

const Minigame: Component = () => {
	const [leaderboard, setLeaderboard] = createSignal<Record<string, number>>({ 'Pizza 🍕': 0, 'Cake 🍰': 0 });
	const names = () => Object.keys(leaderboard());
	const ordered = () => {
		const leads = leaderboard();
		return [...names()].sort((k1, k2) => leads[k2] - leads[k1]);
	};

	function voteFor(name: string) {
		setLeaderboard((prev) => {
			prev[name]++;
			return { ...prev };
		});
	}

	return (
		<div class="mx-auto w-1/2">
			<h2 class="py-3 text-lg">Which one is better?</h2>
			<div class="flex w-full justify-center gap-4">
				<div class="flex flex-1 flex-col justify-center gap-3 text-lg">
					<For each={names()}>
						{(item) => (
							<button onClick={[voteFor, item]} class="rounded-md border-2 border-gray-500 bg-gray-800 p-10 transition-all hover:shadow-md hover:shadow-slate-700">
								{item}
							</button>
						)}
					</For>
				</div>
				<div class="flex-1 rounded-md border-2 border-gray-500  p-2">
					<TransitionGroup name="list-item">
						<For each={ordered()}>
							{(k, i) => (
								<div class="list-item border-b-2 border-gray-600 bg-slate-900 p-2 text-left last:border-b-0">
									<strong>{i() + 1}</strong>. {k} <span class="text-xs text-gray-300">({leaderboard()[k]} votes)</span>
								</div>
							)}
						</For>
					</TransitionGroup>
				</div>
			</div>
		</div>
	);
};
