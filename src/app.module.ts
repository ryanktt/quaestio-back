/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { SessionGuard, SessionModule } from './modules/session';
import { QuestionnaireModule } from './modules/questionnaire';
import { ResponseModule } from './modules/response';
import { UserModule } from './modules/user';
import { UtilsModule } from './utils';

import { ConfigModule, ConfigService } from '@nestjs/config';
import GraphQLModule from '@graphql/graphql.module';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

export interface IEnvirolmentVariables {
	STAGE: string;
	JWT_SECRET: string;
	MONGO_URI: string;

	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_KINESIS_STREAM_NAME: string;
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_FUNCTION_NAME: string;
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_ENDPOINT: string;
	AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION: string;
}

export function isLocal(): boolean {
	return process.env.STAGE === 'local';
}

export function isDevelopment(): boolean {
	return process.env.STAGE === 'dev';
}

export function isProduction(): boolean {
	return process.env.STAGE === 'prod';
}

@Module({
	imports: [
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigService<IEnvirolmentVariables>) => ({
				uri: configService.get('MONGO_URI', { infer: true }),
			}),
			imports: [ConfigModule],
			inject: [ConfigService],
		}),
		GraphQLModule,
		ConfigModule.forRoot({ isGlobal: true }),

		QuestionnaireModule,
		ResponseModule,
		SessionModule,
		UtilsModule,
		UserModule,
	],
	providers: [
		{
			useClass: SessionGuard,
			provide: APP_GUARD,
		},
	],
})
export class AppModule {}
