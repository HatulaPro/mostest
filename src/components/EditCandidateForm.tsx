import type { Option } from '@prisma/client';
import { type Component, createEffect, on } from 'solid-js';
import { createServerAction$ } from 'solid-start/server';
import { z } from 'zod';
import { prisma } from '~/db';
import { useForm } from '~/hooks/useForm';
import { getSession } from '~/routes/api/auth/[...solidauth]';
import { Loading } from './Loading';
import { Modal } from './Modal';

type CandidatesList = {
	id: string;
	image: string | null;
	content: string;
	leaderboardId: string;
	_count: {
		voteFor: number;
		voteAgainst: number;
	};
}[];

const EditCandidateSchema = z.object({ name: z.string(), image: z.string(), candidateId: z.string(), leaderboardId: z.string() });
type EditCandidateType = z.infer<typeof EditCandidateSchema>;

export const EditCandidateForm: Component<{ editingId: number; setEditingId: (v: number) => void; candidates: CandidatesList }> = (props) => {
	const candidate = () => (props.editingId !== -1 ? props.candidates[props.editingId] : null);
	const form = useForm({ name: { parser: z.string(), defaultValue: candidate()?.content }, image: { parser: z.string(), defaultValue: candidate()?.image ?? '' } });

	createEffect(
		on(candidate, (c) => {
			if (c) {
				form.setValue('name', c.content);
				form.setValue('image', c.image ?? '');
			}
		})
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

				const areDifferent = candidate.content !== data.name || candidate.image !== data.image;
				if (!areDifferent) return { success: true, data: { content: candidate.content, id: candidate.id, image: candidate.image, leaderboardId: candidate.leaderboardId } };

				const newCandidate = await prisma.option.update({ where: { id: candidate.id }, data: { content: data.name, image: data.image || undefined } });
				console.log(newCandidate);
				return { success: true, data: newCandidate };
			} catch (e) {
				console.log(e);
				return { success: false };
			}
		},
		{ invalidate: ['leaderboard-options'] }
	);

	return (
		<Modal isOpen={props.editingId !== -1} close={() => props.setEditingId(-1)}>
			<form
				class="flex h-screen flex-col items-center justify-evenly gap-2 p-3 sm:h-auto"
				onSubmit={(e) => {
					e.preventDefault();
					const c = candidate();
					if (!c) return;
					enroll({
						...form.data(),
						leaderboardId: c.leaderboardId,
						candidateId: c.id,
					}).then(() => props.setEditingId(-1));
				}}
			>
				<h2 class="mb-4 text-2xl font-bold">
					Edit <span class="text-red-500">{candidate()?.content}</span>
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
				<div class="flex justify-center gap-2 pb-4 sm:mt-4">
					<button disabled={!form.isValid() || enrolling.pending} type="submit" class="items-center rounded-md bg-red-500 py-1.5 px-3 text-base text-white hover:enabled:bg-red-600 disabled:contrast-75">
						Save
					</button>
					<button type="button" onClick={() => props.setEditingId(-1)} class="flex items-center rounded-md bg-slate-700 py-1.5 px-3 text-base text-white hover:bg-slate-700">
						Cancel
					</button>
				</div>
			</form>
		</Modal>
	);
};
