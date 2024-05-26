/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { upsertQuestionnaireResponse } from './services/upsert-questionnaire-response';
import { IUpsertResponsePayload } from './types/types';
import { SQSHandler } from 'aws-lambda';
import { MongoClient } from 'mongodb';
import { mapSeries } from 'bluebird';

const MONGO_URI = process.env.MONGO_URI || '';
let cache: { mongoClient: MongoClient };

async function bootstrap(): Promise<{ mongoClient: MongoClient }> {
	const mongoClient = await MongoClient.connect(MONGO_URI).catch((err: Error) => {
		throw new Error(`fail to connect to mongodb. error: ${err.message}`);
	});

	return { mongoClient };
}

export const handler: SQSHandler = async (event) => {
	if (!cache) {
		cache = await bootstrap();
	}

	const { mongoClient } = cache;
	await mapSeries(event.Records, async (record) => {
		const payload = (
			typeof record.body === 'string' ? JSON.parse(record.body) : record.body
		) as IUpsertResponsePayload;
		await upsertQuestionnaireResponse({ mongoClient, payload });
	});
};
