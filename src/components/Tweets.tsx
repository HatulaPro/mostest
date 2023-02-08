import { createSignal, For, onCleanup, type Component } from 'solid-js';

type Tweet = {
	image: string;
	displayName: string;
	username: string;
	createdAt: Date;
	content: string;
	counts: {
		quote_tweets: number;
		retweets: number;
		likes: number;
	};
};

const MONTHS = ['UNREACHABLE', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TWEETS: Tweet[] = [
	{
		image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png',
		displayName: 'Zapdos',
		username: 'ZapdosOfficial',
		createdAt: new Date(2023, 2, 7, 20, 22, 0, 0),
		content: 'the bird is freed',
		counts: {
			quote_tweets: 54039,
			retweets: 344985,
			likes: 2447543,
		},
	},
	{
		image: 'https://pbs.twimg.com/profile_images/874276197357596672/kUuht00m_bigger.jpg',
		displayName: 'Donald J. Trump',
		username: 'realDonaldTrump',
		createdAt: new Date(2020, 4, 5, 7, 12, 0, 0),
		content: 'STOP THE COUNT!\nPizza🍕 is CLEARLY better than Cake🍰!',
		counts: {
			quote_tweets: 119524,
			retweets: 45962,
			likes: 219456,
		},
	},
	{
		image: 'https://pbs.twimg.com/profile_images/1102315020015337475/Bzr-5lo6_bigger.png',
		displayName: 'Ash',
		username: 'ashcammm',
		createdAt: new Date(2019, 2, 12, 1, 8, 0, 0),
		content: "guys literally only want one thing and it's fucking disgusting (it's votes for Zapdos)",
		counts: {
			quote_tweets: 1275,
			retweets: 6622,
			likes: 8752,
		},
	},
];

function toTweeterNumber(n: number) {
	if (n > 1_000_000) {
		return (n / 1_000_000).toFixed(1) + 'M';
	} else if (n > 1_000) {
		return (n / 1_000).toFixed(1) + 'K';
	}
	return n;
}

export const Tweets: Component = () => {
	const [currentTweet, setCurrentTweet] = createSignal(0);

	function createInterval() {
		return setInterval(() => {
			setCurrentTweet((prev) => (prev + 1) % TWEETS.length);
		}, 5000);
	}
	const [autoScrollInterval, setAutoScrollInterval] = createSignal(createInterval());

	let tweetsWrapper: HTMLDivElement | undefined;

	onCleanup(() => clearInterval(autoScrollInterval()));

	function setTweetIndex(index: number) {
		setCurrentTweet(index);
		setAutoScrollInterval((prev) => {
			clearInterval(prev);
			return createInterval();
		});
	}

	return (
		<div class="grid w-full max-w-5xl grid-cols-1 gap-4 p-2 sm:grid-cols-2 sm:p-4 md:p-8">
			<div
				onMouseMove={() => {
					clearInterval(autoScrollInterval());
				}}
				onMouseLeave={() =>
					setAutoScrollInterval((prev) => {
						clearInterval(prev);
						return createInterval();
					})
				}
				onScroll={(e) => console.log(e.currentTarget.scrollLeft)}
				class="col-start-1 row-start-2 flex-1 overflow-hidden p-2 text-left sm:row-start-1"
			>
				<div class="grid w-full grid-cols-[100%_100%_100%] gap-4 transition-all duration-300" ref={tweetsWrapper} style={{ transform: `translateX(-${currentTweet() * (100 + 1600 / (tweetsWrapper?.children[0]?.getBoundingClientRect()?.width || Infinity))}%)` }}>
					<For each={TWEETS}>
						{(tweet) => (
							<div class="flex h-full w-full shrink-0 basis-full flex-col rounded-md bg-black p-4">
								<div class="flex items-center gap-2">
									<img class="h-12 w-12 rounded-full object-contain" src={tweet.image} alt={`Profile picture of @${tweet.username}`} />
									<div class="flex flex-col">
										<span class="font-bold">
											{tweet.displayName} <CheckmarkSVG />
										</span>
										<span class="text-zinc-500">@{tweet.username}</span>
									</div>
								</div>
								<p class="whitespace-pre-line py-3 text-xl">{tweet.content}</p>
								<div class="mt-auto text-sm text-zinc-500">
									{tweet.createdAt.getHours() % 12}:{tweet.createdAt.getMinutes()} {tweet.createdAt.getHours() > 12 ? 'PM' : 'AM'}
									{' • '}
									{MONTHS[tweet.createdAt.getMonth()]} {tweet.createdAt.getDate()}, {tweet.createdAt.getFullYear()}
								</div>
								<hr class="my-4 border-zinc-500" />
								<div class="flex gap-2 text-xs font-bold sm:gap-6 sm:text-sm">
									<span class="hover:underline">
										{toTweeterNumber(tweet.counts.retweets)} <span class="font-normal text-zinc-500">Retweets</span>
									</span>
									<span class="hover:underline">
										{toTweeterNumber(tweet.counts.quote_tweets)} <span class="font-normal text-zinc-500">Quote Tweets</span>
									</span>
									<span class="hover:underline">
										{toTweeterNumber(tweet.counts.likes)} <span class="font-normal text-zinc-500">Likes</span>
									</span>
								</div>
							</div>
						)}
					</For>
				</div>
			</div>
			<div class="col-start-1 flex flex-1 flex-col gap-3 p-4 text-left sm:col-start-2">
				<span class="text-xl font-bold text-slate-300">Make more informed decisions</span>
				<h2 class="text-3xl font-bold sm:text-4xl md:text-5xl">
					Understand the <span class="text-red-500">public</span>'s opinion
				</h2>
				<span class="text-lg text-slate-300">{'And influnce it in a fun & reactive game'}</span>
				<span class="text-sm text-slate-400">All tweets seen here are obviously fabricated.</span>
			</div>
			<div class="col-start-1 row-start-3 flex justify-center gap-2 sm:row-start-2">
				<For each={TWEETS}>{(_, i) => <button classList={{ 'bg-white/30': i() === currentTweet(), 'bg-white/80': i() !== currentTweet() }} class="block rounded-full  p-1 hover:bg-white/30" onClick={() => setTweetIndex(i())} />}</For>
			</div>
		</div>
	);
};

const CheckmarkSVG: Component = () => {
	return (
		<svg viewBox="0 0 24 24" role="img" class="inline-block h-4 w-4 fill-blue-600">
			<g>
				<path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
			</g>
		</svg>
	);
};
