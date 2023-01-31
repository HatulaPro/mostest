import { AiOutlineShareAlt } from 'solid-icons/ai';
import type { Component } from 'solid-js';

export const ShareButton: Component<{ text: string; title: string; url: string }> = (props) => {
	return (
		<button
			type="button"
			onClick={() => {
				if (navigator) {
					navigator.share({ text: props.text, title: props.title, url: props.url });
				}
			}}
			class="flex items-center rounded-md bg-slate-700 py-2 px-3 text-white hover:bg-slate-700 disabled:contrast-75"
		>
			<AiOutlineShareAlt class="mr-2 text-xl" />
			Share
		</button>
	);
};
