import { type Component, createSignal, For } from 'solid-js';
import { TransitionGroup } from 'solid-transition-group';
import { safeArg } from '~/utils/functions';

export const Minigame: Component = () => {
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
