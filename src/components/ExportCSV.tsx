import { AiFillCopy, AiOutlineDownload } from 'solid-icons/ai';
import { type Component, batch, createSignal } from 'solid-js';
import server$ from 'solid-start/server';
import Papa from 'papaparse';
import { prisma } from '~/db';
import { createRouteAction } from 'solid-start';
import { Modal } from './Modal';
import { Loading } from './Loading';

export const ExportCSV: Component<{ leaderboardId: string }> = (props) => {
	const [isOpen, setOpen] = createSignal(false);
	const [copied, setCopied] = createSignal(false);
	const [copiedTimeout, setCopiedTimeout] = createSignal<null | ReturnType<typeof setTimeout>>(null);

	const unsetTimeout = () => {
		const to = copiedTimeout();
		if (to) clearTimeout(to);
	};

	const exportCSV = server$(async (id: string) => {
		const options = await prisma.option.findMany({ where: { leaderboardId: id }, select: { image: true, content: true } });
		const mappedOptions = options.map((value) => [value.content, value.image]);
		return Papa.unparse(mappedOptions);
	});

	const close = () => {
		batch(() => {
			setOpen(false);
			setCopied(false);
			unsetTimeout();
			setCopiedTimeout(null);
		});
	};

	const [enrolling, enroll] = createRouteAction(async (file: string) => {
		// if (enrolling.result) return enrolling.result;
		const res = exportCSV(file);
		close();
		return res;
	});

	return (
		<>
			<button
				// disabled={enrolling.pending}
				class="text-xl text-gray-300 hover:text-white active:text-white"
				onClick={() => {
					if (enrolling.result) {
						console.log(enrolling.result);
						batch(() => {
							setOpen(true);
							setCopied(false);
						});
					} else {
						enroll(props.leaderboardId);
						batch(() => {
							setOpen(true);
							setCopied(false);
						});
					}
				}}
			>
				<AiOutlineDownload />
			</button>
			<Modal close={() => close} isOpen={isOpen()}>
				<Loading isLoading={enrolling.pending} />
				<p class="scrollbar relative w-full overflow-scroll border-2 border-gray-500 p-3 pr-10 max-h-80">
					{enrolling.result}
					<button
						class="absolute right-1 top-1 rounded-md bg-slate-800 p-2 text-xs text-white"
						onClick={() => {
							if (enrolling.result) {
								navigator.clipboard.writeText(enrolling.result);
								batch(() => {
									setCopied(true);
									unsetTimeout();
									setCopiedTimeout(setTimeout(() => setCopied(false), 3000));
								});
							}
						}}
					>
						{copied() ? 'copied!' : <AiFillCopy class="text-sm" />}
					</button>
				</p>
			</Modal>
		</>
	);
};
