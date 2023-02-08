import type { Leaderboard, Option } from '@prisma/client';
import { A } from '@solidjs/router';
import { type Component, For } from 'solid-js';

export const LeaderboardView: Component<{
	leaderboard: Leaderboard & {
		options: Option[];
	};
}> = (props) => {
	return (
		<div class="flex h-full w-full flex-col gap-2 rounded-md bg-slate-800 p-3 pb-2 text-left sm:gap-4 sm:p-6">
			<A href={`/${props.leaderboard.slug}`} class="hover:underline">
				<h3 class="text-lg sm:text-2xl">{props.leaderboard.name}</h3>
			</A>
			<span class="text-base sm:text-lg">{props.leaderboard.question}</span>
			<div class="mt-auto">
				<div class="flex justify-start gap-1">
					<For each={props.leaderboard.options}>{(option) => <img src={option.image ?? ''} class="h-8 w-8" alt={option.content} />}</For>
				</div>
				<A href={`/${props.leaderboard.slug}/vote`} class="mx-auto mt-2 block w-min rounded-md bg-red-500 px-4 py-1.5 text-sm hover:bg-red-600 sm:mt-4 sm:text-base">
					Vote
				</A>
			</div>
		</div>
	);
};

export const LeaderboardViewLoading: Component = () => {
	return (
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
	);
};
