/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from '@modules/user';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		MongooseModule.forRoot(
			'mongodb+srv://ryanktt:3301@cluster0.njo09.mongodb.net/questionnaireDatabase?authSource=admin&replicaSet=atlas-bay2b7-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true',
		),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: 'schema.gql',
		}),
		UserModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
