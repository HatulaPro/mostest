export default function Home() {
	return (
		<>
			<div class="absolute top-1/3 left-1/2 aspect-square h-[120%] -translate-x-1/2 rounded-full bg-white bg-opacity-5">
				<div class="absolute inset-0 m-auto aspect-square h-[80%] rounded-full bg-white bg-opacity-5">
					<div class="absolute inset-0 m-auto aspect-square h-[60%] rounded-full bg-white bg-opacity-5"></div>
				</div>
			</div>
			<main class="relative mx-auto flex h-[80vh] max-w-5xl flex-col justify-center p-8 text-center">
				<h1 class="mb-8 text-5xl">
					Turn <span class="font-bold text-red-500">Ideas</span> into <span class="font-bold text-red-500">Leaderboards</span>!
				</h1>
				<p class="text-xl font-bold">Let us turn your leaderboard game idea into reality</p>
				<div class="mx-auto mt-8 flex w-1/2 justify-between rounded-full bg-gray-200 p-2 text-xl">
					<input class="flex-1 rounded-full bg-gray-200 pl-3 text-xl text-black outline-none" type="text" placeholder="What interests you?" />
					<button class="rounded-full bg-red-500 py-3 px-6" type="button">
						Create
					</button>
				</div>
			</main>
		</>
	);
}
