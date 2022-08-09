/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Handler, KinesisStreamEvent } from 'aws-lambda';

export const handler: Handler = async (event: KinesisStreamEvent): Promise<void> => {
	await Promise.all([]);
	console.log(JSON.stringify(event));
	const data = event.Records[0].kinesis.data;
	const payload = JSON.parse(Buffer.from(data, 'base64').toString());
	// do the thing
	console.log(payload);
	console.log(event);
};
