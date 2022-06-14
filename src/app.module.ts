/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { SessionGuard, SessionModule } from './session';
import { UserRepository, UserModule } from './user';
import { UtilsArray, UtilsModule } from './utils';
import { loaders } from './app.loaders';
import { QuizModule } from './quiz';

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
			useFactory: (utilsArray: UtilsArray, userRepository: UserRepository) => ({
				autoSchemaFile: 'schema.gql',
				context: {
					loaders: loaders(userRepository, utilsArray),
				},
			}),
			imports: [UserModule, UtilsModule],
			inject: [UtilsArray, UserRepository],
		}),
		ConfigModule.forRoot(),
		SessionModule,
		UtilsModule,
		QuizModule,
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
