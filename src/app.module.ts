/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SessionGuard, SessionModule } from '@modules/session';
import { UserHelper, UserModule } from '@modules/user';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsArray, UtilsModule } from './utils';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { loaders } from './app.loaders';

@Module({
	imports: [
		MongooseModule.forRoot(
			'mongodb+srv://ryanktt:3301@cluster0.njo09.mongodb.net/questionnaireDatabase?authSource=admin&replicaSet=atlas-bay2b7-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true',
		),
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			useFactory: (utilsArray: UtilsArray, userHelper: UserHelper) => ({
				autoSchemaFile: 'schema.gql',
				context: {
					loaders: loaders(userHelper, utilsArray),
				},
			}),
			imports: [UserModule, UtilsModule],
			inject: [UtilsArray, UserHelper],
		}),
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
