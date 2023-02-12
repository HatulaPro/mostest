import { AiFillFileText } from 'solid-icons/ai';
import type { Component } from 'solid-js';
import { createRouteAction } from 'solid-start';
import server$ from 'solid-start/server';
import Papa from 'papaparse';
import { z } from 'zod';
import { Modal } from './Modal';

const CsvSchema = z.array(
	z
		.array(z.string())
		.length(2)
		.refine((strings) => {
			const [, image] = strings;
			if (image === '') return true;
			const parsed = z.string().url().safeParse(image);
			return parsed.success;
		})
);

export type CsvSchemaType = z.infer<typeof CsvSchema>;

export const ImportCSV: Component<{ onImport: (data: CsvSchemaType) => void }> = (props) => {
	const parseCSV = server$(async (file: string): Promise<{ success: true; data: CsvSchemaType } | { success: false; error: string }> => {
		const { data } = Papa.parse(file);
		const parsed = CsvSchema.safeParse(data);
		if (parsed.success) {
			return { success: true, data: parsed.data };
		} else {
			return { success: false, error: 'Invalid Format' };
		}
	});

	const [enrolling, enroll] = createRouteAction(async (file: string) => {
		const res = parseCSV(file);
		return res;
	});

	const modalError = () => {
		if (!enrolling.result) return enrolling.result;
		if (enrolling.result.success) return null;
		return enrolling.result.error;
	};

	const close = () => enrolling.clear();
	const onDone = (
		data:
			| {
					success: true;
					data: string[][];
			  }
			| {
					success: false;
					error: string;
			  }
	) => {
		if (data.success) props.onImport(data.data);
		else if (inputFile) {
			inputFile.value = inputFile.defaultValue;
		}
	};

	let inputFile: HTMLInputElement | undefined;
	return (
		<div class="relative">
			<input
				hidden
				type="file"
				accept=".csv"
				multiple={false}
				ref={inputFile}
				onChange={async (e) => {
					const file = e.currentTarget.files?.item(0);
					if (!file) return;
					const text = await file.text();
					enroll(text).then(onDone);
				}}
			/>
			<button type="button" onClick={() => inputFile?.click()} disabled={enrolling.pending} class="flex items-center rounded-md bg-slate-700 py-2 px-4 text-sm text-white hover:bg-slate-700 disabled:contrast-75">
				<AiFillFileText class="mx-1 text-xl" />
				Import CSV
			</button>
			<Modal isOpen={Boolean(modalError())} close={() => close}>
				<h3 class="top-full text-lg text-red-500">
					<strong>Error:</strong> {modalError()}
				</h3>
				<p class="mt-3">Please provide a .csv file in the following format: </p>
				<p class="mt-2 w-full overflow-hidden text-ellipsis border-2 border-gray-500 p-2">
					<span class="text-orange-400">someName</span>,<span class="text-blue-400">https://linktoimage.com/</span>
					<br />
					<span class="text-orange-400">noImage</span>,
					<br />
					<span class="text-orange-400">Pickachu</span>,<span class="text-blue-400">https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png</span>
					<br />
					<span class="text-orange-400">Eevee</span>,<span class="text-blue-400">https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png</span>
				</p>
			</Modal>
		</div>
	);
};
