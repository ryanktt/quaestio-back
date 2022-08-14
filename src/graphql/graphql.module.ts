/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IGraphqlContext, getParamsAsObjFromInjectionArgs } from './graphql.interface';
import { loaders } from './graphql.data-loaders';

import { QuestionnaireModule, QuestionnaireRepository } from '@modules/questionnaire';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule, UserRepository } from '@modules/user';
import { UtilsArray, UtilsModule } from '@utils/*';
import { GraphQLModule } from '@nestjs/graphql';
import { getClientIp } from 'request-ip';
import { Request } from 'express';

export default GraphQLModule.forRootAsync<ApolloDriverConfig>({
	driver: ApolloDriver,
	useFactory: (...args) => ({
		autoSchemaFile: 'schema.gql',
		context: (context): IGraphqlContext => {
			const injectedArgs = getParamsAsObjFromInjectionArgs(...(args as Record<string, unknown>[]));
			const headers = context.req.headers as { 'user-agent': string; auth: string };
			const clientIp = getClientIp(context.req as Request) as string;

			return {
				loaders: loaders(injectedArgs),
				userAgent: headers['user-agent'],
				authToken: headers.auth,
				clientIp,
			};
		},
	}),
	inject: [UtilsArray, UserRepository, QuestionnaireRepository],
	imports: [UtilsModule, UserModule, QuestionnaireModule],
});
