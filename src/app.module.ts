/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SessionGuard, SessionModule } from '@modules/session';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from '@modules/user';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
	imports: [
		MongooseModule.forRoot(
			'mongodb+srv://ryanktt:3301@cluster0.njo09.mongodb.net/questionnaireDatabase?authSource=admin&replicaSet=atlas-bay2b7-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true',
		),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: 'schema.gql',
		}),
		SessionModule,
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
