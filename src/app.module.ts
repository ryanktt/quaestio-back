/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SessionGuard, SessionModule } from '@modules/session';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserHelper, UserModule } from '@modules/user';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsArray, UtilsModule } from './utils';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { loaders } from './app.loaders';

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
			useFactory: (utilsArray: UtilsArray, userHelper: UserHelper) => ({
				autoSchemaFile: 'schema.gql',
				context: {
					loaders: loaders(userHelper, utilsArray),
				},
			}),
			imports: [UserModule, UtilsModule],
			inject: [UtilsArray, UserHelper],
		}),
		ConfigModule.forRoot(),
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
