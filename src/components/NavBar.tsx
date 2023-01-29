import { A } from '@solidjs/router';
import { Component } from 'solid-js';
import { useLocation } from 'solid-start';

export const NavBar: Component = () => {
	const location = useLocation();
	const active = (path: string) => (path == location.pathname ? 'border-sky-600' : 'border-transparent hover:border-sky-600');

	return (
		<nav class="fixed top-0 z-50 w-full bg-gray-700 text-white">
			<ul class="container flex items-center p-4">
				<li class={`border-b-2 ${active('/')} mx-1.5 sm:mx-6`}>
					<A href="/">Home</A>
				</li>
			</ul>
		</nav>
	);
};
