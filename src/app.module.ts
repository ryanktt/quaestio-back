/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionGuard, SessionModule } from 'src/session';
import { AdminRepository, UserModule } from 'src/user';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsArray, UtilsModule } from './utils';
import { RespondentModule } from './respondent';
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
			useFactory: (utilsArray: UtilsArray, adminRepository: AdminRepository) => ({
				autoSchemaFile: 'schema.gql',
				context: {
					loaders: loaders(adminRepository, utilsArray),
				},
			}),
			imports: [UserModule, UtilsModule],
			inject: [UtilsArray, AdminRepository],
		}),
		ConfigModule.forRoot(),
		RespondentModule,
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
