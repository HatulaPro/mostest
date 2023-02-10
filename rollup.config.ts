// eslint-disable-next-line
// @ts-ignore
import wasm from 'rollup-plugin-wasm';

export default {
	input: 'web/index.js',
	plugins: [wasm()],
};
