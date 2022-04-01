/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { GraphQLModule } from '@nestjs/graphql';
import UserModule from './user/user.module';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		MongooseModule.forRoot('mongoUriHere'),
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
