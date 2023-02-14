import { For, type Component } from 'solid-js';
import { useAnimatedNumber } from '~/hooks/useAnimatedNumber';
import { range, safeArg } from '~/utils/functions';
import { Loading } from './Loading';

export const Pagination: Component<{ page: number; setPage: (n: number) => void; pageCount: number; preloader: (n: number) => void; isLoading: boolean; isEmpty: boolean }> = (props) => {
	const animatedPageCount = useAnimatedNumber(() => props.pageCount, { startingValue: props.pageCount, duration: 250 });
	const animatedPage = useAnimatedNumber(() => props.page, { startingValue: props.page, duration: 250 });
	return (
		<div class="mb-1 flex w-full items-end justify-center text-left text-xs sm:text-sm">
			{props.isLoading ? (
				<Loading isLoading={props.isLoading} />
			) : props.isEmpty ? (
				<>
					<span class="text-xs text-gray-300">No Results</span>
				</>
			) : (
				<>
					<span class="hidden text-xs text-gray-300 sm:block">
						Showing page {animatedPage().toFixed(0)} of {animatedPageCount().toFixed(0)}
					</span>
					<div class="flex gap-1 sm:ml-auto sm:gap-2">
						{props.pageCount <= 7 ? (
							<RangedButtons from={1} to={props.pageCount + 1} page={props.page} setPage={props.setPage} preloader={props.preloader} />
						) : (
							<>
								<RangedButtons from={1} to={Math.min(props.page < 5 ? 6 : 3, props.pageCount + 1)} page={props.page} setPage={props.setPage} preloader={props.preloader} />
								{props.page >= 5 && <span class="self-end">...</span>}

								{props.page >= 5 && <RangedButtons from={props.page > props.pageCount - 4 ? props.pageCount - 4 : props.page - 1} to={Math.min(props.pageCount + 1, props.page + 2)} page={props.page} setPage={props.setPage} preloader={props.preloader} />}
								{props.page < props.pageCount - 3 && <span class="self-end">...</span>}
								<RangedButtons from={Math.max(props.page + 2, props.pageCount - 1)} to={props.pageCount + 1} page={props.page} setPage={props.setPage} preloader={props.preloader} />
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
};

const RangedButtons: Component<{ from: number; to: number; page: number; setPage: (n: number) => void; preloader: (n: number) => void }> = (props) => {
	return (
		<For each={range(props.from, props.to)}>
			{(num) => (
				<button onPointerEnter={safeArg(props.preloader, num)} onClick={() => props.setPage(num)} classList={{ 'rounded-md px-2 sm:px-3 py-1.5 transition-colors': true, 'bg-slate-500 hover:bg-slate-600': props.page !== num, 'bg-red-500 hover:bg-red-600': props.page === num }}>
					{num}
				</button>
			)}
		</For>
	);
};
