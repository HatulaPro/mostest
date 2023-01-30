import { RouteDataArgs, Outlet, useRouteData, Head, Meta, Title } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { prisma } from '~/db';

export function routeData({ params }: RouteDataArgs) {
	return createServerData$(
		async ([, slug]) => {
			return await prisma.leaderboard.findUnique({ where: { slug } });
		},
		{ key: () => ['leaderboard', params['leaderboard-slug']] }
	);
}

export default function LeaderboardLayout() {
	const data = useRouteData<typeof routeData>();

	return (
		<main class="text-center">
			{data.latest ? (
				<>
					<Head>
						<Meta name="description" content={`Vote and see the results of the Leaderboard of ${data.latest.name}. ${data.latest.question}`} />
						<Title>
							{data.latest.name} - {data.latest.question} | Mostest
						</Title>
					</Head>
					<div class="mx-auto flex max-w-5xl flex-col p-2 pt-14">
						<h1 class="mt-12 text-3xl font-bold text-red-500 sm:text-4xl md:text-5xl">{data.latest.name}</h1>

						<span class="m-2 text-sm font-normal text-gray-300">#{data.latest.slug}</span>
						<h2 class="mt-6 text-lg font-bold sm:text-xl">{data.latest.question}</h2>
						<Outlet />
					</div>
				</>
			) : (
				'NOT FOUND'
			)}
		</main>
	);
}
