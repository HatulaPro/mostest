import { useRouteData } from 'solid-start';

export const routeData = () => {
	return { hello: 'nice.' };
};

export default function Home() {
	const data = useRouteData<typeof routeData>();

	return <main class="text-center mx-auto text-gray-700 p-4">{data.hello}</main>;
}
