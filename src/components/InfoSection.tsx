import { type JSX, type Component, lazy } from 'solid-js';
import { A } from 'solid-start';

const AiOutlineArrowRight = lazy(async () => ({ default: (await import('solid-icons/ai')).AiOutlineArrowRight }));
const AiOutlineControl = lazy(async () => ({ default: (await import('solid-icons/ai')).AiOutlineControl }));
const AiOutlineShareAlt = lazy(async () => ({ default: (await import('solid-icons/ai')).AiOutlineShareAlt }));
const AiOutlineUnorderedList = lazy(async () => ({ default: (await import('solid-icons/ai')).AiOutlineUnorderedList }));

export const InfoSection: Component = () => {
	return (
		<div class="w-full bg-black/30 p-4 sm:p-16 sm:pt-4">
			<div class="mx-auto mt-6 max-w-5xl">
				<img src="/people.svg" class="m-auto block w-[40%] object-contain md:hidden" alt="Image of many people" />
				<h2 class="my-4 text-3xl font-bold sm:text-4xl md:text-5xl">Community Leaderboards</h2>
				<span class="text-lg text-slate-300">Bringing power back to the people</span>
				<div class="mt-12 grid grid-cols-1 gap-4 text-left md:grid-cols-2">
					<Advantage title="Design a Leaderboard" icon={<AiOutlineUnorderedList />}>
						Find out who comes out on top in <i>your</i> own custom leaderboard.
						<br />
						<A class="group relative mt-4 inline-block text-white hover:underline" href="/create">
							Start creating
							<AiOutlineArrowRight class="inline-block translate-x-1 transition-transform group-hover:translate-x-3" />
						</A>
					</Advantage>
					<Advantage title="Use The Wisdom of the Crowd" icon={<AiOutlineShareAlt />}>
						Take advantage of the only reliable way to get the information you want.
					</Advantage>
					<Advantage title="Manage the Data" icon={<AiOutlineControl />}>
						Recieve the best possible answer to your question.
					</Advantage>
					<div class="col-start-2 row-span-3 row-start-1 hidden place-items-center md:grid">
						<img src="/people.svg" class="m-auto h-[70%] object-contain" alt="Image of many people" />
					</div>
				</div>
			</div>
		</div>
	);
};

const Advantage: Component<{ title: string; children: JSX.Element; icon: JSX.Element }> = (props) => {
	return (
		<div class="col-start-1">
			<div class="flex items-center gap-4">
				<span class="w-min rounded-md bg-red-700 p-2 text-2xl sm:text-3xl">{props.icon}</span>
				<h3 class="text-lg sm:text-2xl">{props.title}</h3>
			</div>
			<p class="mt-2 ml-14 text-sm text-slate-300 sm:ml-16 sm:mt-3 sm:text-base">{props.children}</p>
		</div>
	);
};
