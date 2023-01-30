import { children, Component, JSX } from 'solid-js';
import { Portal } from 'solid-js/web';

export const Modal: Component<{ children: JSX.Element; close: () => void; isOpen: boolean }> = (props) => {
	const c = children(() => props.children);
	let mainRef: HTMLDivElement | undefined;
	return (
		<Portal>
			<div
				classList={{ hidden: !props.isOpen }}
				class="fixed top-0 left-0 z-50 grid h-screen w-screen place-items-center bg-slate-600 bg-opacity-20"
				onClick={(e) => {
					if (e.target === e.currentTarget) {
						props.close();
					}
				}}
			>
				<div ref={mainRef} class="[#070b15] w-full max-w-2xl rounded-md bg-slate-900 p-3 shadow-md shadow-black">
					{c}
				</div>
			</div>
		</Portal>
	);
};
