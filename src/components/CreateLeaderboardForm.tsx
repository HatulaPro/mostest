import { TransitionGroup } from 'solid-transition-group';
import { type Component, createSignal, For, createEffect, batch } from 'solid-js';
import { AiOutlineClose, AiOutlinePlus } from 'solid-icons/ai';
import { ImportCSV } from '~/components/ImportCSV';
import { z } from 'zod';
import { createServerAction$ } from 'solid-start/server';
import { prisma } from '~/db';
import { useForm } from '~/hooks/useForm';
import type { Leaderboard } from '@prisma/client';
import { Loading } from '~/components/Loading';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { createStore } from 'solid-js/store';
import { getSession } from '~/routes/api/auth/[...solidauth]';
import clickOutside from '~/bindings/click-outside';
import { slugify } from '~/utils/functions';
import { useAnimatedNumber } from '~/hooks/useAnimatedNumber';
import { Pagination } from './Pagination';
import { Warning } from './Warning';
import { useSession } from '~/db/useSession';
import { UploadFileButton } from './UploadFileButton';
import { useFileUploader } from '~/hooks/useFileUploader';
// eslint-disable-next-line
const clickOutsideDirective = clickOutside;

const CreateLeaderboardSchema = z.object({
	name: z.string().min(2, 'Name must contain at least 2 characters').max(24, 'Name must contain at most 24 characters'),
	slug: z
		.string()
		.min(2, 'Slug must contain at least 2 characters')
		.max(24, 'Slug must contain at most 24 characters')
		.regex(/^[a-z0-9\-]*$/g, 'Only lowercase letters, digits and dashes (-) are allowed.'),
	description: z.string().min(4, 'Question must contain at least 4 characters').max(64, 'Question must contain at most 64 characters'),
	candidates: z.array(z.object({ id: z.string().optional(), name: z.string().max(64), image: z.string().max(256) })).max(500),
});
type CreateLeaderboardType = z.infer<typeof CreateLeaderboardSchema>;

const PAGE_SIZE = 17;

const [currentlyEditing, setCurrentlyEditing] = createSignal<number>(-1);
const [candidates, setCandidates] = createStore<{ id: number; name: string; image: string }[]>([
	{ id: 1, name: 'Zapdos', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png' },
	{ id: 2, name: 'Castform', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/351.png' },
	{ id: 3, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
]);

export const CreateLeaderboardForm: Component<{
	name: string;
}> = (props) => {
	const user = useSession();
	const form = useForm({ name: { parser: CreateLeaderboardSchema.shape.name, defaultValue: props.name }, slug: { parser: CreateLeaderboardSchema.shape.slug }, description: { parser: CreateLeaderboardSchema.shape.description } });
	const animatedCandidatesCount = useAnimatedNumber(() => candidates.length, { startingValue: candidates.length, duration: 200, steps: 7 });

	const [searchParams, setSearchParams] = useSearchParams<{ page: string }>();
	const page = () => parseInt(searchParams.page) || 1;
	const setPage = (n: number) => setSearchParams({ ...searchParams, page: `${n}` });
	const pageCount = () => Math.ceil((candidates.length || PAGE_SIZE) / PAGE_SIZE);

	createEffect(() => {
		if (page() > pageCount()) {
			setPage(pageCount());
		}
	});

	const navigate = useNavigate();
	function addCandidate() {
		const currentLength = candidates.length;
		batch(() => {
			setCandidates((p) => [...p, { id: 1 + Math.max(0, ...p.map((c) => c.id)), name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' }]);
			setPage(Math.ceil((currentLength + 1) / PAGE_SIZE));
		});
	}

	const [enrolling, enroll] = createServerAction$(async (data: CreateLeaderboardType, { request }): Promise<{ success: true; data: { leaderboard: Leaderboard; candidates: number } } | { success: false }> => {
		const parsed = CreateLeaderboardSchema.safeParse(data);
		if (!parsed.success) {
			return { success: false };
		}

		try {
			const user = await getSession(request);
			// If no ID givem create a new leaderboard
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
			class="grid w-full place-items-center overflow-hidden pt-16"
		>
			<div class="flex w-full max-w-5xl flex-col gap-3 rounded-md p-2 text-left sm:p-8">
				<h2 class="my-8 text-center text-3xl sm:text-4xl md:text-5xl">
					Create <span class="font-bold text-red-500">Leaderboard</span>
				</h2>
				{Boolean(!user.latest?.user) && <Warning content="You are not logged in, which means you will not be able to edit this leaderboard." />}

				<div class="flex w-full items-start gap-2">
					<div class="flex-1">
						<input required class="w-full rounded-md border-2 border-gray-500 bg-gray-800 p-2 text-white outline-none transition-colors focus:border-gray-200" type="text" value={props.name || form.getValue('name')} onInput={(e) => form.setValue('name', e.currentTarget.value)} placeholder="Roundest" />
						<span class="text-sm text-red-400">{form.getError('name')}</span>
					</div>
					<div class="flex-[2]">
						<input
							required
							class="w-full rounded-md border-2 border-gray-500 bg-gray-800 p-2 text-white outline-none transition-colors focus:border-gray-200"
							type="text"
							value={form.getValue('slug')}
							onInput={(e) => {
								const slugified = slugify(e.currentTarget.value);
								if (e.currentTarget.value !== slugified) e.currentTarget.value = slugified;
								form.setValue('slug', slugified);
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
					<input required class="w-full rounded-md  border-2 border-gray-500 bg-gray-800 p-2 text-white outline-none transition-colors focus:border-gray-200" type="text" placeholder="Which Pok??mon is Rounder?" value={form.getValue('description')} onInput={(e) => form.setValue('description', e.currentTarget.value)} />
					<span class="text-sm text-red-400">{form.getError('description')}</span>
				</div>
				<div class="mt-6 flex flex-wrap items-center gap-2">
					<Pagination page={page()} setPage={setPage} pageCount={pageCount()} />
					<h3 class="shrink-0 basis-full text-lg sm:basis-auto">
						Candidates <span class="text-sm">({animatedCandidatesCount().toFixed(0)}/500)</span>:
					</h3>
					<button type="button" onClick={() => setCandidates([])} class="ml-auto rounded-md bg-slate-700 py-2 px-4 text-sm text-white hover:bg-slate-700">
						Clear All
					</button>
					<ImportCSV
						onImport={(data) => {
							setCandidates((p) => {
								const copy = [...p];
								let id = 1 + Math.max(0, ...copy.map((c) => (typeof c.id === 'number' ? c.id : 0)));
								for (const [name, image] of data) {
									copy.push({ id, image, name });
									++id;
								}
								return copy.slice(0, 500);
							});
						}}
					/>
					<button type="button" disabled={candidates.length >= 500} onClick={addCandidate} class="block disabled:opacity-50 rounded-md bg-red-500 py-2 px-4 text-sm text-white enabled:hover:bg-red-600 sm:hidden">
						Add
					</button>
				</div>
				<div class="flex flex-col flex-wrap items-center gap-2 sm:flex-row">
					<button type="button" onClick={addCandidate} disabled={candidates.length >= 500} class="hidden h-48 w-36 place-items-center rounded-md border-2 border-gray-500 bg-gray-800 p-4 transition-colors enabled:hover:border-gray-200 sm:grid">
						{candidates.length >= 500 ? (
							<span class="text-red-400">Candidates limit exceeded</span>
						) : (
							<div class="grid aspect-square h-16 w-16 place-items-center rounded-full bg-white bg-opacity-20 text-3xl text-white">
								<AiOutlinePlus />
							</div>
						)}
					</button>
					<TransitionGroup name="animated-x-list-item">
						<For each={candidates.slice(PAGE_SIZE * (page() - 1), PAGE_SIZE * page())}>{(item) => <CandidateForm candidate={item} />}</For>
					</TransitionGroup>
				</div>
				<Loading isLoading={enrolling.pending} />
				<div class="mx-auto flex gap-2">
					<button disabled={!form.isValid()} type="submit" class="mt-4 items-center rounded-md bg-red-500 py-2 px-4 text-lg text-white hover:enabled:bg-red-600 disabled:contrast-75">
						Create
					</button>
				</div>
			</div>
		</form>
	);
};

const CandidateForm: Component<{
	candidate: {
		id: number;
		name: string;
		image: string;
	};
}> = (props) => {
	const [isDragging, setDragging] = createSignal(false);

	const { upload, isLoading, errorMessage, abort } = useFileUploader((data) => {
		if (data.success) {
			setCandidates((c) => c.id === currentlyEditing(), 'image', data.location);
		}
	});

	return (
		<div
			onDragEnter={(e) => {
				e.preventDefault();
				e.stopPropagation();
				setDragging(true);
				setCurrentlyEditing(props.candidate.id);
			}}
			onDragOver={(e) => {
				e.preventDefault();
				e.stopPropagation();
				setDragging(true);
				setCurrentlyEditing(props.candidate.id);
			}}
			use:clickOutsideDirective={() => setCurrentlyEditing(-1)}
			onClick={() => setCurrentlyEditing(props.candidate.id)}
			classList={{ 'sm:gap-2': props.candidate.id === currentlyEditing() }}
			class="animated-x-list-item relative flex w-full flex-col overflow-hidden rounded-md bg-gray-800 py-4 px-2 sm:h-48 sm:w-auto sm:flex-row"
		>
			<div class="mx-auto flex w-20 flex-col items-center justify-between sm:w-32">
				{isLoading() ? <Loading isLoading /> : <img src={props.candidate.image} draggable={false} class="h-full p-2 object-contain" />}
				<span class="text-center">{props.candidate.name}</span>
			</div>
			<div classList={{ 'sm:w-64': props.candidate.id === currentlyEditing(), 'sm:w-0': props.candidate.id !== currentlyEditing() }} class="z-10 flex h-40 w-full flex-1 flex-col justify-evenly gap-2 overflow-hidden bg-gray-800 transition-all sm:gap-0 relative">
				<input
					class="rounded-md px-3 py-1.5 text-black bg-slate-300 outline-none"
					type="text"
					value={props.candidate.name}
					onInput={(e) => {
						if (e.currentTarget.value.length > 64) e.currentTarget.value = e.currentTarget.value.slice(0, 64);
						setCandidates((c) => c.id === currentlyEditing(), 'name', e.currentTarget.value);
					}}
				/>

				<UploadFileButton
					isLoading={isLoading()}
					onInput={(e) => {
						upload(e.currentTarget.files);
					}}
					onCancel={abort}
				/>
				{errorMessage() && <span class="bottom-0 absolute block mx-auto text-xs text-red-400">{errorMessage()}</span>}
			</div>
			<button
				onClick={(e) => {
					e.preventDefault();
					setCandidates((p) => {
						return p.filter((c) => c.id !== props.candidate.id);
					});
					setCurrentlyEditing(-1);
				}}
				class="absolute top-0 left-0 z-10 grid h-6 w-6 place-items-center bg-red-500"
			>
				<AiOutlineClose />
			</button>
			{isDragging() && (
				<div
					class="border-2 border-dashed z-10 border-white absolute inset-0 w-full h-full"
					onDragLeave={(e) => {
						e.preventDefault();
						e.stopPropagation();

						setDragging(false);
					}}
					onDrop={async (e) => {
						e.preventDefault();
						e.stopPropagation();
						setDragging(false);
						upload(e.dataTransfer?.files);
					}}
				/>
			)}
		</div>
	);
};
