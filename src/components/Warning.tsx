import { AiFillWarning } from 'solid-icons/ai';
import { createSignal, type Component } from 'solid-js';

export const Warning: Component<{ content: string }> = (props) => {
	const [isOpen, setOpen] = createSignal(true);

	return (
		<div class="transition-all duration-300 border-2 border-yellow-700 p-3 rounded-md bg-black/20 text-base" style={{ 'max-height': isOpen() ? '160px' : '0px', transform: isOpen() ? 'scale(1)' : 'scale(0)' }}>
			<div class="flex gap-2 items-center">
				<AiFillWarning class="text-2xl fill-yellow-500" />
				{props.content}
			</div>
			<div class="basis-full">
				<button onClick={() => setOpen(false)} type="button" class="rounded-md text-red-400 hover:bg-white/10 p-2 transition-all ml-auto block">
					Dismiss
				</button>
			</div>
		</div>
	);
};
