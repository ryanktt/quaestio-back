/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { upsertQuestionnaireResponse } from './services/upsert-questionnaire-response';
import { Handler, KinesisStreamEvent } from 'aws-lambda';
import { IUpsertResponsePayload } from './types/types';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || '';
let cache: { mongoClient: MongoClient };

async function bootstrap(): Promise<{ mongoClient: MongoClient }> {
	const mongoClient = await MongoClient.connect(MONGO_URI).catch((err: Error) => {
		throw new Error(`fail to connect to mongodb. error: ${err.message}`);
	});

	return { mongoClient };
}

export const handler: Handler = async (event: KinesisStreamEvent | IUpsertResponsePayload): Promise<void> => {
	if (!cache) {
		cache = await bootstrap();
	}

	const { mongoClient } = cache;

	let payload = event as IUpsertResponsePayload;
	if ('Records' in event) {
		payload = JSON.parse(Buffer.from(event.Records[0].kinesis.data, 'base64').toString());
	}

	await upsertQuestionnaireResponse({ mongoClient, payload });
};
