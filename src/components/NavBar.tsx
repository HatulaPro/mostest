import { A } from '@solidjs/router';
import { Component } from 'solid-js';
import { useSession } from '~/db/useSession';
import { signIn, signOut } from '@auth/solid-start/client';

export const NavBar: Component = () => {
	const user = useSession();

	return (
		<nav class="fixed top-0 z-50 flex w-full items-center border-b-2 border-gray-700 bg-gray-900 text-white">
			{/* <div class="container flex flex-shrink-[3] items-center justify-start p-2"> */}
			<A href="/">
				<img src="/logo.svg" class="m-2 max-h-[2rem] object-contain sm:max-h-[2.8rem]" />
			</A>
			{/* </div> */}
			<div class="container flex items-center justify-end p-4">
				<A class={`mx-1.5 transition-colors duration-500 hover:text-red-400 sm:mx-6`} href="/">
					Home
				</A>
				{user.latest ? (
					<>
						<A class={`mx-1.5 transition-colors duration-500 hover:text-red-400 sm:mx-6`} href="/profile">
							Profile
						</A>
						<button class={`mx-1.5 transition-colors duration-500 hover:text-red-400 sm:mx-6`} onClick={() => signOut()}>
							Sign Out
						</button>
					</>
				) : (
					<button class={`mx-1.5 transition-colors duration-500 hover:text-red-400 sm:mx-6`} onClick={() => signIn()}>
						Sign In
					</button>
				)}
			</div>
		</nav>
	);
};
