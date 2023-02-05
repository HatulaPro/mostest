import { signIn } from '@auth/solid-start/client';
import { A } from '@solidjs/router';
import { For, Suspense } from 'solid-js';
import { Head, Title, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { ExportCSV } from '~/components/ExportCSV';
import { prisma } from '~/db';
import { getUser } from '../api/auth/[...solidauth]';

export const routeData = () => {
	return createServerData$(
		async (_, { request }) => {
			try {
				const user = await getUser(request);
				return { user, leaderboards: await prisma.leaderboard.findMany({ where: { ownerId: user.id }, include: { options: { take: 4 } } }) };
			} catch {
				return null;
			}
		},
		{ key: () => ['profile'] }
	);
};

export default function ProfilePage() {
	const data = useRouteData<typeof routeData>();

	return (
		<main class="text-center">
			<Suspense
				fallback={
					<div class="mx-auto flex max-w-5xl flex-col p-2 pt-20">
						<h1 class="mt-12 text-2xl text-white sm:text-3xl md:text-4xl">Your Leaderboards</h1>
						<div class="mx-auto mt-12 flex w-full flex-col overflow-hidden rounded-md border-2 border-gray-500 text-left">
							<For each={[1, 2, 3]}>
								{() => (
									<div class="flex items-center gap-2 p-3 hover:bg-black hover:bg-opacity-20">
										<span class="animate-pulse bg-slate-700 text-lg font-bold text-transparent">NAME OF THING</span>
										<span class="animate-pulse bg-slate-700 text-base text-transparent">SOME QUESTION ABOUT IT?</span>
										<div class="ml-auto flex h-8 gap-2">
											<For each={[1, 2, 3, 4]}>{() => <div class="h-full w-8 animate-pulse bg-slate-700 object-contain text-transparent" />}</For>
										</div>
									</div>
								)}
							</For>
						</div>
					</div>
				}
			>
				{data.latest ? (
					<>
						<Head>
							<Title>{data.latest.user?.name}'s Profile | Mostest</Title>
						</Head>
						<div class="mx-auto flex max-w-5xl flex-col p-2 pt-20">
							<h1 class="mt-12 text-2xl text-white sm:text-3xl md:text-4xl">
								<span class="font-bold text-red-500">{data.latest.user?.name}</span>'s Leaderboards
							</h1>
							<div class="mx-auto mt-12 flex w-full flex-col overflow-hidden rounded-md border-2 border-gray-500 text-left">
								<For each={data.latest.leaderboards}>
									{(leaderboard) => (
										<div class="flex flex-col items-start gap-2 border-b-2 border-gray-700 p-3 last:border-b-0 hover:bg-black hover:bg-opacity-20 sm:flex-row sm:items-center">
											<A href={`/${leaderboard.slug}`} class="text-lg font-bold hover:underline ">
												{leaderboard.name} <span class="text-base font-normal text-gray-300">{leaderboard.question}</span>
											</A>
											<div class="ml-auto flex h-8 gap-2">
												<For each={leaderboard.options.filter((x) => typeof x.image === 'string')}>{(option) => <img class="h-full object-contain" src={option.image ?? ''} />}</For>
												<ExportCSV leaderboardId={leaderboard.id} />
											</div>
										</div>
									)}
								</For>
							</div>
						</div>
					</>
				) : (
					<>
						<Head>
							<Title>Profile | Mostest</Title>
						</Head>
						<div class="grid h-screen w-full place-items-center">
							<div>
								<p>You are not signed in.</p>
								<button class="rounded-md bg-red-500 px-4 py-2 hover:bg-red-600" onClick={() => signIn()}>
									Sign In
								</button>
							</div>
						</div>
					</>
				)}
			</Suspense>
		</main>
	);
}
