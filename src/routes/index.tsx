import { Index } from 'solid-js';
import { Component, createSignal, For } from 'solid-js';
import { TransitionGroup } from 'solid-transition-group';
import { AiOutlineClose, AiOutlinePlus } from 'solid-icons/ai';
import clickOutside from '~/bindings/click-outside';
import { ImportCSV } from '~/components/ImportCSV';
import { z } from 'zod';
import { createServerAction$, redirect } from 'solid-start/server';
import { prisma } from '~/db';
import { useForm } from '~/hooks/useForm';
import { Leaderboard } from '@prisma/client';
import { Loading } from '~/components/Loading';
import { useNavigate } from '@solidjs/router';
const clickOutsideDirective = clickOutside;

let createLeaderboardFormRef: HTMLFormElement | undefined;
export default function Home() {
	const [newLeaderboardName, setNewLeaderboardName] = createSignal('');
	return (
		<>
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
				<CreateLeaderboardForm name={newLeaderboardName()} />
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
									<button class="ml-auto rounded-md bg-red-500 px-4 py-1.5" onClick={[voteFor, k]}>
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

const CreateLeaderboardSchema = z.object({
	name: z.string().min(2, 'Name must contain at least 2 characters').max(24, 'Name must contain at most 24 characters'),
	slug: z
		.string()
		.min(2, 'Slug must contain at least 2 characters')
		.max(24, 'Name must contain at most 24 characters')
		.regex(/^[a-z0-9\-]*$/g, 'Only lowercase letters, digits and dashes (-) are allowed.'),
	description: z.string().min(4, 'Question must contain at least 4 characters').max(64, 'Question must contain at most 64 characters'),
	candidates: z.array(z.object({ id: z.number(), name: z.string(), image: z.string() })),
});
type CreateLeaderboardType = z.infer<typeof CreateLeaderboardSchema>;

const CreateLeaderboardForm: Component<{ name: string }> = (props) => {
	const form = useForm({ name: CreateLeaderboardSchema.shape.name, slug: CreateLeaderboardSchema.shape.slug, description: CreateLeaderboardSchema.shape.description });

	const [candidates, setCandidates] = createSignal([
		{ id: 1, name: 'Zapdos', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png' },
		{ id: 2, name: 'Castform', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/351.png' },
		{ id: 3, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
	]);
	const [currentlyEditing, setCurrentlyEditing] = createSignal(-1);

	const navigate = useNavigate();
	function addCandidate() {
		setCandidates((p) => [...p, { id: 1 + Math.max(0, ...p.map((c) => c.id)), name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' }]);
		console.log(candidates());
	}

	const [enrolling, enroll] = createServerAction$(async (data: CreateLeaderboardType): Promise<{ success: true; data: { leaderboard: Leaderboard; candidates: number } } | { success: false }> => {
		const parsed = CreateLeaderboardSchema.safeParse(data);
		if (!parsed.success) {
			return { success: false };
		}

		// TODO: Add owner id
		try {
			const leaderboard = await prisma.leaderboard.create({ data: { name: parsed.data.name, question: parsed.data.description, slug: data.slug, ownerId: undefined } });
			const leaderboardId = leaderboard.id;
			const candidates = (await prisma.option.createMany({ data: parsed.data.candidates.map((c) => ({ image: c.image.length ? c.image : undefined, content: c.name, leaderboardId })) })).count;
			return { success: true, data: { leaderboard, candidates } };
		} catch (e) {
			return { success: false };
		}
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				enroll({
					...form.data(),
					candidates: candidates(),
				}).then((res) => {
					if (res.success) {
						navigate(`/${res.data.leaderboard.slug}`);
					}
				});
			}}
			ref={createLeaderboardFormRef}
			class="grid min-h-screen w-full place-items-center overflow-hidden pt-14"
		>
			<div class="flex w-full max-w-5xl flex-col gap-3 rounded-md bg-black bg-opacity-30 p-2 text-left sm:p-8">
				<h2 class="mb-2 text-2xl sm:text-4xl">
					Create <span class="font-bold text-red-500">Leaderboard</span>
				</h2>
				<div class="flex w-full items-start gap-2">
					<div class="flex-1">
						<input required class="w-full rounded-md border-2 border-gray-500 bg-gray-800 p-2 text-white outline-none transition-colors focus:border-gray-200" type="text" value={props.name || form.formState['name'].value} onInput={(e) => form.setValue('name', e.currentTarget.value)} placeholder="Roundest" />
						<span class="text-sm text-red-400">{form.getError('name')}</span>
					</div>
					<div class="flex-[2]">
						<input
							required
							class="w-full rounded-md border-2 border-gray-500 bg-gray-800 p-2 text-white outline-none transition-colors focus:border-gray-200"
							type="text"
							value={form.formState['slug'].value}
							onInput={(e) => {
								form.setValue('slug', e.currentTarget.value);
							}}
							placeholder="roundest-pokemon"
						/>
						<span class="text-sm text-red-400">
							{enrolling.result?.success === false && form.getValue('slug') === enrolling.input?.slug && 'Slug is taken. '}
							{form.getError('slug')}
						</span>
					</div>
				</div>
				<div class="w-full">
					<input required class="w-full rounded-md  border-2 border-gray-500 bg-gray-800 p-2 text-white outline-none transition-colors focus:border-gray-200" type="text" placeholder="Which Pokémon is Rounder?" value={form.formState['description'].value} onInput={(e) => form.setValue('description', e.currentTarget.value)} />
					<span class="text-sm text-red-400">{form.getError('description')}</span>
				</div>
				<div class="mt-4 flex items-center">
					<h3 class="text-lg">Candidates:</h3>
					<button type="button" onClick={() => setCandidates([])} class="ml-auto rounded-md bg-slate-700 py-2 px-4 text-sm text-white hover:bg-slate-700">
						Clear All
					</button>
					<button type="button" onClick={addCandidate} class="ml-2 block rounded-md bg-red-500 py-2 px-4 text-sm text-white hover:bg-red-600 sm:hidden">
						Add
					</button>
				</div>
				<div class="flex flex-col flex-wrap items-center gap-2 sm:flex-row">
					<button type="button" onClick={addCandidate} class="hidden h-48 w-36 place-items-center rounded-md border-2 border-gray-500 bg-gray-800 p-4 transition-colors hover:border-gray-200 sm:grid">
						<div class="grid aspect-square h-16 w-16 place-items-center rounded-full bg-white bg-opacity-20 text-3xl text-white">
							<AiOutlinePlus />
						</div>
					</button>
					<TransitionGroup name="animated-x-list-item">
						<Index each={candidates()}>
							{(item) => (
								<div use:clickOutsideDirective={() => setCurrentlyEditing(-1)} onClick={() => setCurrentlyEditing(item().id)} classList={{ 'gap-2': item().id === currentlyEditing() }} class="animated-x-list-item relative flex flex-col overflow-hidden rounded-md border-2 border-gray-500 bg-gray-800 py-4 px-2 sm:h-48 sm:flex-row">
									<div class="mx-auto flex w-20 flex-col items-center justify-between sm:w-32">
										<img src={item().image} class="h-full object-contain" />
										<span>{item().name}</span>
									</div>
									<div classList={{ 'sm:w-64': item().id === currentlyEditing(), 'sm:w-0': item().id !== currentlyEditing() }} class="z-10 flex h-40 w-full flex-1 flex-col justify-evenly gap-2 overflow-hidden bg-gray-800 transition-all">
										<input
											class="rounded-full px-3 py-1.5 text-black outline-none"
											type="text"
											value={item().image}
											onChange={(e) =>
												setCandidates((p) => {
													return p.map((c) => (c.id === currentlyEditing() ? { ...c, image: e.currentTarget.value } : c));
												})
											}
										/>
										<input
											class="rounded-full px-3 py-1.5 text-black outline-none"
											type="text"
											value={item().name}
											onChange={(e) =>
												setCandidates((p) => {
													return p.map((c) => (c.id === currentlyEditing() ? { ...c, name: e.currentTarget.value } : c));
												})
											}
										/>
									</div>
									<button
										onClick={(e) => {
											e.preventDefault();
											setCurrentlyEditing(-1);
											setCandidates((p) => {
												return p.filter((c) => c !== item());
											});
										}}
										class="absolute top-0 right-0 z-10 grid h-7 w-7 place-items-center bg-red-500"
									>
										<AiOutlineClose />
									</button>
								</div>
							)}
						</Index>
					</TransitionGroup>
				</div>
				<Loading isLoading={enrolling.pending} />
				<div class="mx-auto flex gap-2">
					<ImportCSV
						onImport={(data) => {
							setCandidates((p) => {
								let id = 1 + Math.max(0, ...p.map((c) => c.id));
								for (const [name, image] of data) {
									p.push({ id, image, name });
									++id;
								}
								return [...p];
							});
						}}
					/>
					<button disabled={!form.isValid()} type="submit" class="mt-4 items-center rounded-md bg-red-500 py-2 px-4 text-lg text-white hover:enabled:bg-red-600 disabled:contrast-75">
						Create
					</button>
				</div>
			</div>
		</form>
	);
};
