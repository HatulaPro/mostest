import { children, type Component, type JSX } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

export const Modal: Component<{ children: JSX.Element; close: () => void; isOpen: boolean }> = (props) => {
	const c = children(() => props.children);
	return (
		<Portal>
			<Transition name="animated-modal">
				{props.isOpen && (
					<div
						class="animated-modal fixed top-0 left-0 z-50 grid h-screen w-screen place-items-center bg-slate-600 bg-opacity-20"
						onClick={(e) => {
							if (e.target === e.currentTarget) {
								props.close();
							}
						}}
					>
						<div class="w-full max-w-2xl rounded-md bg-slate-900 p-3 shadow-md shadow-black">{c}</div>
					</div>
				)}
			</Transition>
		</Portal>
	);
};
