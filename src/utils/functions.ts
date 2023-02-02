const a = 'a'.charCodeAt(0);
const z = 'z'.charCodeAt(0);
const zero = '0'.charCodeAt(0);
const nine = '9'.charCodeAt(0);
const dash = '-'.charCodeAt(0);
export function slugify(s: string) {
	const current = s.toLowerCase();
	let result = '';
	for (let i = 0; i < current.length; ++i) {
		const c = current.charCodeAt(i);
		if ((c >= a && c <= z) || (c >= zero && c <= nine) || c === dash) result += current[i];
	}
	console.log({ s, result });
	return result;
}

export function range(start: number, end: number) {
	if (end < start) return [];
	return new Array<number>(end - start).fill(0).map((_, i) => start + i);
}
