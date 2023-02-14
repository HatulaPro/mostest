import { createEffect, on, onCleanup } from 'solid-js';
import { createSignal } from 'solid-js';

export const useAnimatedNumber = (num: () => number, options?: { steps?: number; duration?: number; startingValue?: number }) => {
	const [animatedNum, setAnimatedNum] = createSignal(options?.startingValue ?? 0);
	const [animationInterval, setAnimationInterval] = createSignal<ReturnType<typeof setInterval> | null>(null);

	const duration = options?.duration ?? 500;
	const steps = options?.steps ?? 15;
	const timeBetweenChange = Math.floor(duration / steps);

	createEffect(
		on(num, (n) => {
			if (animatedNum() === n) {
				return;
			}
			const step = (n - animatedNum()) / steps;
			setAnimationInterval((prev) => {
				if (prev) clearInterval(prev);
				return setInterval(() => {
					if (Math.abs(animatedNum() - n) < 1) {
						setAnimatedNum(n);
						const self = animationInterval();
						if (self) clearInterval(self);
					} else {
						setAnimatedNum((p) => (p < n ? Math.min(n, p + step) : Math.max(n, p + step)));
					}
				}, timeBetweenChange);
			});
			onCleanup(() => {
				const self = animationInterval();
				if (self) clearInterval(self);
			});
		})
	);

	return animatedNum;
};
