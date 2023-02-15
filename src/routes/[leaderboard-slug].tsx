import { createEffect } from 'solid-js';
import { type RouteDataArgs, Outlet, useRouteData, useNavigate } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { LeaderboardMeta } from '~/components/LeaderboardMeta';
import { Loading } from '~/components/Loading';
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

	const navigate = useNavigate();
	createEffect(() => {
		if (!data.loading && !data()) {
			navigate('/', { replace: true });
		}
	});

	return (
		<main class="text-center">
			{data.latest ? (
				<>
					<LeaderboardMeta leaderboard={data.latest} />
					<div class="mx-auto flex max-w-5xl flex-col p-2 pt-10">
						<h1 class="mt-12 text-3xl font-bold text-red-500 sm:text-4xl md:text-5xl">{data.latest.name}</h1>

						<span class="m-2 text-sm font-normal text-gray-300">#{data.latest.slug}</span>
						<h2 class="mt-6 text-lg font-bold sm:text-xl">{data.latest.question}</h2>
						<Outlet />
					</div>
				</>
			) : (
				!data.loading && (
					<>
						<div class="h-screen w-full grid place-items-center text-center">
							<div class="flex flex-col gap-4">
								<h1 class="text-2xl">Not Found</h1>
								<Loading isLoading={true} />
								<span>Redirecting...</span>
							</div>
						</div>
					</>
				)
			)}
		</main>
	);
}
