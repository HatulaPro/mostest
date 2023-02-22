import { createRouteAction } from 'solid-start';
import { type UploadFileResponse, UploadFileSchema } from '~/components/UploadFileButton';

export const useFileUploader = (onComplete?: (data: UploadFileResponse) => void) => {
	const [enrolling, enroll] = createRouteAction(
		async ({ abortController, fileData }: { fileData: File; abortController: AbortController }) => {
			if (fileData.size > 524_288) return { success: false, error: 'FILE_TOO_BIG' } satisfies UploadFileResponse;
			const response = await fetch('/api/upload', { method: 'POST', body: fileData, signal: abortController.signal });
			const json = await response.json();
			const parsed = UploadFileSchema.parse(json);

			if (parsed.success) {
				if (onComplete) {
					onComplete(parsed);
				}
			}

			return parsed;
		},
		{ invalidate: ['nothing'] }
	);
	const ERRORS = {
		FILE_TOO_BIG: 'Max file size is 0.5MB',
		INVALID_FILE_TYPE: 'Only images are allowed',
		UNKNOWN: 'not connect to server',
	} as const;

	return {
		upload: (fileList: FileList | undefined | null) => {
			const file = fileList?.item(0);
			if (!file) return;
			enroll({ fileData: file, abortController: new AbortController() });
		},
		isLoading: () => enrolling.pending,
		errorMessage: () => (enrolling.result?.success === false ? ERRORS[enrolling.result.error] : null),
		abort: () => {
			enrolling.input?.abortController.abort();
			enrolling.clear();
		},
	} as const;
};
