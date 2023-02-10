import satori from 'satori';
import { type APIEvent, redirect } from 'solid-start';
import { prisma } from '~/db';

const interFont = fetch(new URL('https://github.com/rsms/inter/blob/master/docs/font-files/Inter-Regular.woff?raw=true')).then((res) => res.arrayBuffer());
const interFontBold = fetch(new URL('https://github.com/rsms/inter/blob/master/docs/font-files/Inter-Bold.woff?raw=true')).then((res) => res.arrayBuffer());
export async function GET(e: APIEvent) {
	const slug = e.params['slug'];
	if (!slug || typeof slug !== 'string') return redirect('/');

	const [inter, interBold, leaderboard] = await Promise.all([interFont, interFontBold, prisma.leaderboard.findUnique({ where: { slug }, include: { options: { take: 4 } } })]);
	if (!leaderboard) return redirect('/');

	const res = await satori(
		{
			type: 'div',
			props: {
				children: [
					{ type: 'h1', props: { children: leaderboard.name, style: { fontSize: leaderboard.name.length > 10 ? (leaderboard.name.length > 20 ? '42px' : '48px') : '54px', fontWeight: '900', whiteSpace: 'pre-line', paddingRight: '40px' } } },
					{ type: 'h3', props: { children: leaderboard.question, style: { fontSize: '32px', fontWeight: '400' } } },
					{
						type: 'div',
						props: {
							children: leaderboard.options
								.filter(({ image }) => image)
								.map((option) => {
									return { type: 'img', props: { src: option.image, style: { height: '96px', objectFit: 'contain' } } };
								}),
							style: { display: 'flex', width: '100%', gap: '10px', justifyContent: 'center', marginTop: 'auto' },
						},
					},
					{ type: 'img', props: { src: 'https://github.com/HatulaPro/mostest/blob/master/public/logo.svg?raw=true', style: { height: '48px', position: 'absolute', top: '78px', right: '64px' } } },
					{ type: 'span', props: { children: 'Powered by Mostest', style: { position: 'absolute', bottom: '12px', right: '12px', color: '#cbd5e1' } } },
				],
				style: { position: 'relative', color: 'white', backgroundImage: 'linear-gradient(to bottom, #1e293b, #111827)', fontFamily: 'Inter', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '64px' },
			},
		},
		{
			width: 600,
			height: 400,
			fonts: [
				{
					name: 'Inter',
					data: inter,
					style: 'normal',
					weight: 400,
				},
				{
					name: 'Inter',
					data: interBold,
					style: 'normal',
					weight: 900,
				},
			],
		}
	);
	const headers = new Headers();
	headers.set('Content-Type', 'image/svg+xml');
	headers.set('Cache-Control', 'public, immutable, no-transform, max-age=86400');

	return new Response(res, { status: 200, headers });
}
