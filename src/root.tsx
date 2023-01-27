// @refresh reload
import { Suspense } from 'solid-js';
import { useLocation, A, Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from 'solid-start';
import './root.css';

export default function Root() {
	const location = useLocation();
	const active = (path: string) => (path == location.pathname ? 'border-sky-600' : 'border-transparent hover:border-sky-600');
	return (
		<Html lang="en">
			<Head>
				<Title>SolidStart - With TailwindCSS</Title>
				<Meta charset="utf-8" />
				<Meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<Body class="min-h-screen bg-gray-900 text-white">
				<Suspense>
					<ErrorBoundary>
						<nav class="fixed top-0 w-full bg-white">
							<ul class="container flex items-center p-3 text-black">
								<li class={`border-b-2 ${active('/')} mx-1.5 sm:mx-6`}>
									<A href="/">Home</A>
								</li>
								<li class={`border-b-2 ${active('/about')} mx-1.5 sm:mx-6`}>
									<A href="/about">About</A>
								</li>
							</ul>
						</nav>
						<div class="absolute inset-0 -z-10 h-2/3 w-full" style={{ 'background-size': '20px 20px', background: 'linear-gradient(to bottom,transparent,#111827 300px),radial-gradient(#777777 1px,transparent 0) 0 0/20px 20px fixed,radial-gradient(#777777 1px,transparent 0) 10px 10px/20px 20px fixed' }}></div>
						<Routes>
							<FileRoutes />
						</Routes>
					</ErrorBoundary>
				</Suspense>
				<Scripts />
			</Body>
		</Html>
	);
}
