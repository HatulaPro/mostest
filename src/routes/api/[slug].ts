import satori from 'satori';
import { type APIEvent, redirect } from 'solid-start';
import { prisma } from '~/db';
import { Resvg } from '@resvg/resvg-js';

const interFont = fetch(new URL('https://github.com/rsms/inter/blob/master/docs/font-files/Inter-Regular.woff?raw=true')).then((res) => res.arrayBuffer());
const interFontBold = fetch(new URL('https://github.com/rsms/inter/blob/master/docs/font-files/Inter-Bold.woff?raw=true')).then((res) => res.arrayBuffer());
export async function GET(e: APIEvent) {
	const slug = e.params['slug'];
	if (!slug || typeof slug !== 'string') return redirect('/');

	const [inter, interBold, leaderboard] = await Promise.all([interFont, interFontBold, prisma.leaderboard.findUnique({ where: { slug }, include: { options: { take: 4 } } })]);
	if (!leaderboard) return redirect('/');

	const svg = await satori(
		{
			type: 'div',
			props: {
				children: [
					{ type: 'h1', props: { children: leaderboard.name, style: { fontSize: leaderboard.name.length > 10 ? '28px' : '36px', fontWeight: '900', whiteSpace: 'pre-line', marginTop: '4px', marginBottom: '0px' } } },
					{ type: 'h3', props: { children: leaderboard.question, style: { fontSize: '20px', fontWeight: '400' } } },
					{
						type: 'div',
						props: {
							children: leaderboard.options
								.filter(({ image }) => image)
								.map((option) => {
									return { type: 'img', props: { src: option.image, style: { height: '54px', objectFit: 'contain', borderRadius: '8px' } } };
								}),
							style: { display: 'flex', width: '100%', gap: '10px', justifyContent: 'center', marginTop: 'auto', paddingBottom: '12px' },
						},
					},
					// { type: 'img', props: { src: 'https://github.com/HatulaPro/mostest/blob/master/public/logo.svg?raw=true', style: { height: '32px', position: 'absolute', top: '78px', right: '64px' } } },
					{ type: 'span', props: { children: 'Powered by Mostest', style: { position: 'absolute', bottom: '6px', right: '6px', color: '#cbd5e1', fontSize: '10px' } } },
				],
				style: { position: 'relative', color: 'white', backgroundImage: 'linear-gradient(to bottom, #1e293b, #111827)', fontFamily: 'Inter', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '12px' },
			},
		},
		{
			width: 250,
			height: 250,
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
	headers.set('Content-Type', 'image/png');
	headers.set('Cache-Control', 'public, immutable, no-transform, max-age=86400');

	const resvg = new Resvg(svg, {
		background: 'transparent',
		fitTo: {
			mode: 'width',
			value: 512,
		},
		font: {
			loadSystemFonts: false,
		},
	});
	const pngData = resvg.render().asPng();

	return new Response(pngData, { status: 200, headers });
}
