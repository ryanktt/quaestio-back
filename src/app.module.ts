import 'reflect-metadata';
import {
	Field,
	Query,
	Resolver,
	ObjectType,
	GraphQLModule,
} from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';

@ObjectType()
class Test {
	@Field()
	teste: string;
}

@Resolver()
class TestResolver {
	@Query(() => Test)
	createTest(): Test {
		return { teste: 'Hello World' };
	}
}

@Module({
	providers: [TestResolver],
})
export default class TestModule {}

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: 'schema.gql',
		}),
		TestModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
