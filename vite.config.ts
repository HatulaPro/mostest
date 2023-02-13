import solid from 'solid-start/vite';
import { defineConfig } from 'vite';
import vercel from 'solid-start-vercel';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
	plugins: [wasm(), topLevelAwait(), solid({ ssr: true, adapter: vercel({ edge: false }) })],
	ssr: { external: ['@prisma/client'] },
});
