// import { ImageResponse } from '@vercel/og';
// import { type APIEvent } from 'solid-start';
// import { prisma } from '~/db';

// const interFont = fetch(new URL('https://github.com/rsms/inter/blob/master/docs/font-files/Inter-Regular.woff?raw=true')).then((res) => res.arrayBuffer());
// const interFontBold = fetch(new URL('https://github.com/rsms/inter/blob/master/docs/font-files/Inter-Bold.woff?raw=true')).then((res) => res.arrayBuffer());
export async function GET() {
	// const slug = e.params['slug'];
	// if (!slug || typeof slug !== 'string') return redirect('/');
	// const [inter, interBold, leaderboard] = await Promise.all([interFont, interFontBold, prisma.leaderboard.findUnique({ where: { slug }, include: { options: { take: 5 } } })]);
	// if (!leaderboard) return redirect('/');

	// const res = new ImageResponse(
	// 	{
	// 		type: 'div',
	// 		props: {
	// 			children: [
	// 				{ type: 'h1', props: { children: leaderboard.name, style: { fontSize: leaderboard.name.length > 10 ? (leaderboard.name.length > 20 ? '54px' : '64px') : '72px', fontWeight: '900', whiteSpace: 'pre-line', paddingRight: '230px' } } },
	// 				{ type: 'h3', props: { children: leaderboard.question, style: { fontSize: '42px', fontWeight: '400', paddingRight: '230px' } } },
	// 				{
	// 					type: 'div',
	// 					props: {
	// 						children: leaderboard.options
	// 							.filter(({ image }) => image)
	// 							.map((option) => {
	// 								return { type: 'img', props: { src: option.image, style: { height: '154px', objectFit: 'contain', borderRadius: '8px' } } };
	// 							}),
	// 						style: { display: 'flex', width: '100%', gap: '10px', justifyContent: 'center', marginTop: 'auto' },
	// 					},
	// 				},
	// 				{ type: 'img', props: { src: 'https://mostest.vercel.app/logo.png', style: { width: '154px', position: 'absolute', top: '64px', right: '64px' } } },
	// 				{ type: 'span', props: { children: 'Powered by Mostest', style: { position: 'absolute', bottom: '12px', right: '12px', color: '#cbd5e1', fontSize: '22px' } } },
	// 			],
	// 			style: { position: 'relative', color: 'white', backgroundImage: 'linear-gradient(to bottom, #1e293b, #111827)', fontFamily: 'Inter', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '64px', paddingBottom: '32px' },
	// 		},
	// 	},
	// 	{
	// 		width: 1200,
	// 		height: 600,
	// 		fonts: [
	// 			{
	// 				name: 'Inter',
	// 				data: inter,
	// 				style: 'normal',
	// 				weight: 400,
	// 			},
	// 			{
	// 				name: 'Inter',
	// 				data: interBold,
	// 				style: 'normal',
	// 				weight: 900,
	// 			},
	// 		],
	// 	}
	// );
	// const headers = new Headers();
	// headers.set('Content-Type', 'image/png');
	// headers.set('Cache-Control', 'public, immutable, no-transform, max-age=86400');
	// try {
	// 	// const pnged = await sharp(Buffer.from(res)).resize(1200, 600).png().toBuffer();
	// 	return res;
	// 	// return new Response(res, { status: 200, headers });
	// } catch (e) {
	// 	console.log(e);
	// }
	return new Response('error');
}
