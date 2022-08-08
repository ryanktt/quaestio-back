/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { SessionGuard, SessionModule } from './modules/session';
import { QuestionnaireHelper, QuestionnaireModule, QuestionnaireRepository } from './modules/questionnaire';
import { ResponseModule, ResponseRepository } from './modules/response';
import { UserRepository, UserModule } from './modules/user';
import { UtilsArray, UtilsModule } from './utils';
import { loaders } from './app.loaders';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
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
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			useFactory: (
				utilsArray: UtilsArray,
				userRepository: UserRepository,
				questionnaireRepository: QuestionnaireRepository,
			) => ({
				autoSchemaFile: 'schema.gql',
				context: {
					loaders: loaders(utilsArray, userRepository, questionnaireRepository),
				},
			}),
			inject: [UtilsArray, UserRepository, ResponseRepository, QuestionnaireHelper, QuestionnaireRepository],
			imports: [UtilsModule, UserModule, ResponseModule, QuestionnaireModule],
		}),
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
