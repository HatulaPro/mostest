import { AiOutlineUpload } from 'solid-icons/ai';
import { type Component } from 'solid-js';
import { z } from 'zod';

export const UploadFileSchema = z.discriminatedUnion('success', [
	z.object({
		success: z.literal(true),
		location: z.string(),
	}),
	z.object({
		success: z.literal(false),
		error: z.enum(['UNKNOWN', 'FILE_TOO_BIG', 'INVALID_FILE_TYPE']),
	}),
]);
export type UploadFileResponse = z.infer<typeof UploadFileSchema>;

export const UploadFileButton: Component<{
	isLoading: boolean;
	onInput: (
		e: InputEvent & {
			currentTarget: HTMLInputElement;
			target: Element;
		}
	) => void;
}> = (props) => {
	return (
		<label class="relative">
			<input class="hidden" onInput={(e) => props.onInput(e)} disabled={props.isLoading} type="file" aria-label="Browse file" />
			<span class="cursor-pointer mx-auto rounded-md px-3 py-1.5 text-black transition-colors flex gap-2 items-center justify-center w-fit" classList={{ 'bg-slate-300 hover:bg-slate-400 cursor-pointer': !props.isLoading, 'bg-slate-400 cursor-wait': props.isLoading }}>
				<AiOutlineUpload />
				Upload
			</span>
		</label>
	);
};
