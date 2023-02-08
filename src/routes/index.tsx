import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { Head, Meta, Title } from 'solid-start';
import { InfoSection } from '~/components/InfoSection';
import { Minigame } from '~/components/MiniGame';
import { TopLeaderboards } from '~/components/TopLeaderboards';
import { Tweets } from '~/components/Tweets';

export default function Home() {
	const [newLeaderboardName, setNewLeaderboardName] = createSignal('');
	const navigate = useNavigate();
	return (
		<>
			<Head>
				<Title>Mostest | Build your leaderboard</Title>
				<Meta name="description" content="Build your community driven leaderboard on Mostest. " />
			</Head>
			<main class="text-center">
				<div class="mx-auto flex h-screen max-w-5xl flex-col justify-evenly p-2 pt-14">
					<div class="m-auto flex flex-col justify-center px-2">
						<h1 class="mb-4 text-3xl sm:text-4xl md:mb-8 md:text-5xl">
							Turn <span class="font-bold text-red-500">Ideas</span> into <span class="font-bold text-red-500">Leaderboards</span>!
						</h1>
						<p class="hidden text-xl font-bold md:block">Let us turn your leaderboard game idea into reality</p>
						<form
							class="text-md mx-auto mt-8 flex w-full justify-between rounded-full bg-gray-200 p-2 md:w-2/3 md:text-xl"
							onSubmit={(e) => {
								e.preventDefault();
								const params = new URLSearchParams({ name: newLeaderboardName() });
								navigate(`/create?${params}`);
							}}
						>
							<input value={newLeaderboardName()} onChange={(e) => setNewLeaderboardName(e.currentTarget.value)} class="text-md flex-1 rounded-full bg-gray-200 pl-3 text-black outline-none md:text-xl" type="text" placeholder="What interests you?" />
							<button type="submit" class="rounded-full bg-red-500 py-1.5 px-4 transition-colors hover:bg-red-600 md:py-3 md:px-6">
								Create
							</button>
						</form>
					</div>
					<Minigame />
				</div>
				<div class="my-20 grid w-full place-items-center">
					<TopLeaderboards />
				</div>
				<div class="my-20 grid w-full place-items-center">
					<Tweets />
				</div>
				<div class="my-20 grid w-full place-items-center">
					<InfoSection />
				</div>
				{/* <div class="grid min-h-screen w-full place-items-center bg-gradient-to-b from-transparent via-black/30 to-black/30">
					<CreateLeaderboardForm name={newLeaderboardName()} ref={createLeaderboardFormRef} />
				</div> */}
			</main>
		</>
	);
}
