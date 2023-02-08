import { Head, Meta, Title, useSearchParams } from 'solid-start';
import { CreateLeaderboardForm } from '~/components/CreateLeaderboardForm';

export default function CreateLeaderboard() {
	const [params] = useSearchParams<{ name: string }>();
	const name = () => params.name ?? '';
	return (
		<>
			<Head>
				<Title>Mostest | Create Leaderboard</Title>
				<Meta name="description" content="Build your community driven leaderboard on Mostest. " />
			</Head>
			<CreateLeaderboardForm name={name()} />
		</>
	);
}
