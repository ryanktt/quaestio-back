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

interface IEnvirolmentVariables {
	MONGO_URI: string;
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
		ConfigModule.forRoot(),

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
