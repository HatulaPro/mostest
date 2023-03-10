import type { Leaderboard } from '@prisma/client';
import type { Component } from 'solid-js';
import { Meta, Title } from 'solid-start';

export const LeaderboardMeta: Component<{ leaderboard: Leaderboard }> = (props) => {
	const title = () => `${props.leaderboard.name} - ${props.leaderboard.question} | Mostest`;
	const description = () => `Vote and see the results of the Leaderboard of ${props.leaderboard.name}. ${props.leaderboard.question}`;
	return (
		<>
			<Title>{title()}</Title>
			<Meta name="title" content={title()} />
			<Meta name="description" content={description()} />

			{/* Open Graph / Facebook */}
			<Meta property="og:type" content="object" />
			<Meta property="og:url" content={`https://mostest.vercel.app/${props.leaderboard.slug}`} />
			<Meta property="og:title" content={title()} />
			<Meta property="og:description" content={description()} />
			<Meta property="og:image" content={`https://mostest.vercel.app/api/${props.leaderboard.slug}`} />
			<Meta property="og:image:width" content="250" />
			<Meta property="og:image:height" content="250" />
			<Meta property="og:image:alt" content={`Image for ${props.leaderboard.name}`} />
			<Meta property="og:site_name" content="Mostest" />

			{/* Twitter */}
			<Meta property="twitter:card" content="summary_large_image" />
			<Meta property="twitter:url" content={`https://mostest.vercel.app/${props.leaderboard.slug}`} />
			<Meta property="twitter:title" content={title()} />
			<Meta property="twitter:description" content={description()} />
			<Meta property="twitter:image:src" content={`https://mostest.vercel.app/api/${props.leaderboard.slug}`} />
			<Meta property="twitter:image:alt" content={`Image for ${props.leaderboard.name}`} />
		</>
	);
};
