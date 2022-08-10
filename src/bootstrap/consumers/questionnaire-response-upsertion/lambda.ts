/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Handler, KinesisStreamEvent } from 'aws-lambda';
import { MongoClient } from 'mongodb';
import { upsertQuestionnaireResponse } from './service';

const MONGO_URI = process.env.MONGO_URI || '';
let cache: { mongoClient: MongoClient };

async function bootstrap(): Promise<{ mongoClient: MongoClient }> {
	const mongoClient = await MongoClient.connect(MONGO_URI).catch((err: Error) => {
		throw new Error(`fail to connect to mongodb. error: ${err.message}`);
	});

	return { mongoClient };
}

export const handler: Handler = async (event: KinesisStreamEvent): Promise<void> => {
	if (!cache) {
		cache = await bootstrap();
	}

	const { mongoClient } = cache;
	const data = event.Records[0].kinesis.data;
	const payload = JSON.parse(Buffer.from(data, 'base64').toString());

	await upsertQuestionnaireResponse({ mongoClient, payload });
};
