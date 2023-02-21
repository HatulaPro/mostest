import { type APIEvent, json } from 'solid-start';
import { serverEnv } from '~/env/server';
import S3 from 'aws-sdk/clients/s3';
import { type UploadFileResponse } from '~/components/UploadFileButton';

export async function POST(e: APIEvent) {
	try {
		const blob = await e.request.blob();
		if (blob.size > 524_288) {
			return json<UploadFileResponse>({ success: false, error: 'FILE_TOO_BIG' });
		}
		const type = blob.type;
		if (type !== 'image/jpeg' && type !== 'image/png') {
			return json<UploadFileResponse>({ success: false, error: 'INVALID_FILE_TYPE' });
		}
		const randomName = (Math.random() + 1).toString(16).substring(7) + (blob.type === 'image/png' ? '.png' : '.jpeg');

		const s3 = new S3({ region: 'eu-central-1', credentials: { accessKeyId: serverEnv.AWS_BUCKET_ACCESS_KEY, secretAccessKey: serverEnv.AWS_BUCKET_SECRET_ACCESS_KEY } });
		const res = await s3.upload({ ACL: 'public-read', Bucket: 'hatula-mostest', Key: randomName, Body: new Uint8Array(await blob.arrayBuffer()) }).promise();

		return json<UploadFileResponse>({ success: true, location: res.Location });
	} catch (e) {
		console.log(e);
		return json<UploadFileResponse>({ success: false, error: 'UNKNOWN' });
	}
}
