import type { Option } from '@prisma/client';
import { AiFillDelete } from 'solid-icons/ai';
import { type Component, createEffect, on } from 'solid-js';
import { createServerAction$ } from 'solid-start/server';
import { z } from 'zod';
import { prisma } from '~/db';
import { useForm } from '~/hooks/useForm';
import { getSession } from '~/routes/api/auth/[...solidauth]';
import { Loading } from './Loading';
import { Modal } from './Modal';

type Candidate = {
	id: string;
	image: string | null;
	content: string;
	leaderboardId: string;
	_count: {
		voteFor: number;
		voteAgainst: number;
	};
};

const EditCandidateSchema = z.object({ action: z.union([z.literal('edit'), z.literal('remove')]), name: z.string(), image: z.string(), candidateId: z.string(), leaderboardId: z.string() });
type EditCandidateType = z.infer<typeof EditCandidateSchema>;

export const EditCandidateForm: Component<{ isOpen: boolean; close: () => void; candidate: Candidate | undefined }> = (props) => {
	// const candidate = () => (props.editingId !== -1 ? props.candidates[props.editingId] : null);
	const form = useForm({ name: { parser: z.string(), defaultValue: props.candidate?.content }, image: { parser: z.string(), defaultValue: props.candidate?.image ?? '' } });

	createEffect(
		on(
			() => props.candidate,
			(c) => {
				if (c) {
					form.setValue('name', c.content);
					form.setValue('image', c.image ?? '');
				}
			}
		)
	);

	const [enrolling, enroll] = createServerAction$(
		async (data: EditCandidateType, { request }): Promise<{ success: false } | { success: true; data: Option }> => {
			const parsed = EditCandidateSchema.safeParse(data);
			if (!parsed.success) {
				return { success: false };
			}
			try {
				const [candidate, user] = await Promise.all([prisma.option.findUnique({ where: { id: parsed.data.candidateId }, include: { leaderboard: true } }), getSession(request)]);
				const uid = user?.user?.id;
				if (!uid) return { success: false };
				if (!candidate || candidate.leaderboard.ownerId !== uid) return { success: false };

				if (data.action === 'edit') {
					const areDifferent = candidate.content !== data.name || candidate.image !== data.image;
					if (!areDifferent) return { success: true, data: { content: candidate.content, id: candidate.id, image: candidate.image, leaderboardId: candidate.leaderboardId } };

					const newCandidate = await prisma.option.update({ where: { id: candidate.id }, data: { content: data.name, image: data.image || undefined } });
					return { success: true, data: newCandidate };
				} else if (data.action === 'remove') {
					const newCandidate = await prisma.option.delete({ where: { id: candidate.id } });
					return { success: true, data: newCandidate };
				} else {
					return { success: false };
				}
			} catch (e) {
				console.log(e);
				return { success: false };
			}
		},
		{ invalidate: ['leaderboard-options'] }
	);

	return (
		<Modal isOpen={props.isOpen} close={props.close}>
			<form
				class="flex h-screen flex-col items-center justify-evenly gap-2 p-3 sm:h-auto"
				onSubmit={(e) => {
					e.preventDefault();
					const c = props.candidate;
					if (!c) return;
					enroll({
						action: 'edit',
						...form.data(),
						leaderboardId: c.leaderboardId,
						candidateId: c.id,
					}).then(props.close);
				}}
			>
				<h2 class="mb-4 text-2xl font-bold">
					Edit <span class="text-red-500">{props.candidate?.content}</span>
				</h2>

				<input
					required
					class="w-full rounded-md border-2 border-gray-500 bg-gray-800 p-2 text-white outline-none transition-colors focus:border-gray-200"
					type="text"
					value={form.data()['name']}
					onInput={(e) => {
						form.setValue('name', e.currentTarget.value);
					}}
					placeholder="Candidate name"
				/>
				<div class="grid aspect-square h-32 place-items-center rounded-md border-2 border-gray-500">{form.data()['image'] ? <img src={form.data()['image']} alt="Image for candidate" class="h-full object-contain" /> : 'No image.'}</div>
				<textarea
					class="h-auto w-full rounded-md border-2 border-gray-500 bg-gray-800 p-2 text-white outline-none transition-colors focus:border-gray-200"
					rows={4}
					value={form.data()['image']}
					onInput={(e) => {
						form.setValue('image', e.currentTarget.value);
					}}
					placeholder="Url to image"
				/>
				<Loading isLoading={enrolling.pending} />
				<div class="flex justify-center gap-2 sm:mt-4">
					<button disabled={!form.isValid() || enrolling.pending} type="submit" class="items-center rounded-md bg-red-500 py-1.5 px-3 text-base text-white hover:enabled:bg-red-600 disabled:contrast-75">
						Save
					</button>
					<button type="button" onClick={props.close} class="flex items-center rounded-md bg-slate-700 py-1.5 px-3 text-base text-white hover:bg-slate-700">
						Cancel
					</button>
					<button
						type="button"
						onClick={() => {
							const c = props.candidate;
							if (!c) return;
							enroll({
								action: 'remove',
								...form.data(),
								leaderboardId: c.leaderboardId,
								candidateId: c.id,
							}).then(props.close);
						}}
						class="flex items-center rounded-md bg-slate-700 py-1.5 px-3 text-base text-white hover:bg-slate-700"
					>
						<AiFillDelete class="mr-2 text-lg" />
						Remove
					</button>
				</div>
			</form>
		</Modal>
	);
};
