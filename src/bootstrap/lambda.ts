/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { Handler, Context, Callback } from 'aws-lambda';

import serverlessExpress from '@vendia/serverless-express';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

interface ICache {
	server: Handler;
	app: INestApplication;
}

let cache: ICache;

async function bootstrapServer(): Promise<ICache> {
	const app = await NestFactory.create(AppModule);
	await app.init();
	const expressApp = app.getHttpAdapter().getInstance();
	const server = serverlessExpress({ app: expressApp });

	return { server, app };
}

export const handler: Handler = async (event: any, context: Context, cb: Callback) => {
	if (!cache) {
		cache = await bootstrapServer();
	}

	return cache.server(event, context, cb);
};
