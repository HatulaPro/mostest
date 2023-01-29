import { Component } from 'solid-js';

export const Loading: Component<{ isLoading: boolean }> = (props) => {
	return <div class="m-auto rounded-full border-2 border-white border-b-transparent transition-all" classList={{ 'animate-spin h-6 w-6 opacity-1': props.isLoading, 'opacity-0 w-0 h-6': !props.isLoading }}></div>;
};
