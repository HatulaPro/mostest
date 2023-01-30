import { TransitionGroup } from 'solid-transition-group';
import { Component, createSignal, For } from 'solid-js';
import { AiOutlineClose, AiOutlinePlus } from 'solid-icons/ai';
import { ImportCSV } from '~/components/ImportCSV';
import { z } from 'zod';
import { createServerAction$ } from 'solid-start/server';
import { prisma } from '~/db';
import { useForm } from '~/hooks/useForm';
import { Leaderboard } from '@prisma/client';
import { Loading } from '~/components/Loading';
import { useNavigate } from '@solidjs/router';
import { createStore } from 'solid-js/store';
import { getSession } from '~/routes/api/auth/[...solidauth]';
import clickOutside from '~/bindings/click-outside';
const clickOutsideDirective = clickOutside;

const CreateLeaderboardSchema = z.object({
	name: z.string().min(2, 'Name must contain at least 2 characters').max(24, 'Name must contain at most 24 characters'),
	slug: z
		.string()
		.min(2, 'Slug must contain at least 2 characters')
		.max(24, 'Name must contain at most 24 characters')
		.regex(/^[a-z0-9\-]*$/g, 'Only lowercase letters, digits and dashes (-) are allowed.'),
	description: z.string().min(4, 'Question must contain at least 4 characters').max(64, 'Question must contain at most 64 characters'),
	candidates: z.array(z.object({ id: z.string().optional(), name: z.string(), image: z.string() })),
});
type CreateLeaderboardType = z.infer<typeof CreateLeaderboardSchema>;

export const CreateLeaderboardForm: Component<{ name: string; ref: HTMLFormElement | undefined; title: 'Create' | 'Edit' }> = (props) => {
	const form = useForm({ name: CreateLeaderboardSchema.shape.name, slug: CreateLeaderboardSchema.shape.slug, description: CreateLeaderboardSchema.shape.description });

	// ID is number: new candidate
	// ID is string: existing candidate
	const [candidates, setCandidates] = createStore<{ id: string | number; name: string; image: string }[]>([
		{ id: 1, name: 'Zapdos', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png' },
		{ id: 2, name: 'Castform', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/351.png' },
		{ id: 3, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
	]);
	const [currentlyEditing, setCurrentlyEditing] = createSignal<string | number>(-1);

	const navigate = useNavigate();
	function addCandidate() {
		setCandidates((p) => [...p, { id: 1 + Math.max(0, ...p.map((c) => (typeof c.id === 'number' ? c.id : 0))), name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' }]);
	}

	const [enrolling, enroll] = createServerAction$(async (data: CreateLeaderboardType, { request }): Promise<{ success: true; data: { leaderboard: Leaderboard; candidates: number } } | { success: false }> => {
		const parsed = CreateLeaderboardSchema.safeParse(data);
		if (!parsed.success) {
			return { success: false };
		}

		try {
			const user = await getSession(request);
			const leaderboard = await prisma.leaderboard.create({ data: { name: parsed.data.name, question: parsed.data.description, slug: data.slug, ownerId: user?.user?.id } });
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
					candidates: candidates.map((c) => ({ ...c, id: typeof c.id === 'string' ? c.id : undefined })),
				}).then((res) => {
					if (res.success) {
						navigate(`/${res.data.leaderboard.slug}`);
					}
				});
			}}
			ref={props.ref}
			class="grid min-h-screen w-full place-items-center overflow-hidden pt-14"
		>
			<div class="flex w-full max-w-5xl flex-col gap-3 rounded-md bg-black bg-opacity-30 p-2 text-left sm:p-8">
				<h2 class="mb-2 text-2xl sm:text-4xl">
					{props.title} <span class="font-bold text-red-500">Leaderboard</span>
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
						<For each={candidates}>
							{(item) => (
								<div use:clickOutsideDirective={() => setCurrentlyEditing(-1)} onClick={() => setCurrentlyEditing(item.id)} classList={{ 'gap-2': item.id === currentlyEditing() }} class="animated-x-list-item relative flex flex-col overflow-hidden rounded-md border-2 border-gray-500 bg-gray-800 py-4 px-2 sm:h-48 sm:flex-row">
									<div class="mx-auto flex w-20 flex-col items-center justify-between sm:w-32">
										<img src={item.image} class="h-full object-contain" />
										<span>{item.name}</span>
									</div>
									<div classList={{ 'sm:w-64': item.id === currentlyEditing(), 'sm:w-0': item.id !== currentlyEditing() }} class="z-10 flex h-40 w-full flex-1 flex-col justify-evenly gap-2 overflow-hidden bg-gray-800 transition-all">
										<input class="rounded-full px-3 py-1.5 text-black outline-none" type="text" value={item.image} onChange={(e) => setCandidates((c) => c.id === currentlyEditing(), 'image', e.currentTarget.value)} />
										<input class="rounded-full px-3 py-1.5 text-black outline-none" type="text" value={item.name} onChange={(e) => setCandidates((c) => c.id === currentlyEditing(), 'name', e.currentTarget.value)} />
									</div>
									<button
										onClick={(e) => {
											e.preventDefault();
											setCandidates((p) => {
												return p.filter((c) => c.id !== item.id);
											});
											setCurrentlyEditing(-1);
										}}
										class="absolute top-0 right-0 z-10 grid h-7 w-7 place-items-center bg-red-500"
									>
										<AiOutlineClose />
									</button>
								</div>
							)}
						</For>
					</TransitionGroup>
				</div>
				<Loading isLoading={enrolling.pending} />
				<div class="mx-auto flex gap-2">
					<ImportCSV
						onImport={(data) => {
							setCandidates((p) => {
								let id = 1 + Math.max(0, ...p.map((c) => (typeof c.id === 'number' ? c.id : 0)));
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
