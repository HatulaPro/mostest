// @refresh reload
import { Suspense } from 'solid-js';
import { useLocation, A, Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from 'solid-start';
import { NavBar } from './components/NavBar';
import './root.css';

export default function Root() {
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
						<NavBar />
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
