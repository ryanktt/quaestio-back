/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IGraphqlContext, getParamsAsObjFromInjectionArgs } from './graphql.interface';
import { loaders } from './graphql.data-loaders';

import { QuestionnaireRepository } from '@modules/questionnaire/questionnaire.repository';
import { QuestionnaireModule } from '@modules/questionnaire/questionnaire.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserRepository } from '@modules/user/user.repository';
import { UserModule } from '@modules/user/user.module';
import { UtilsModule } from '@utils/utils.module';
import { GraphQLModule } from '@nestjs/graphql';
import { UtilsArray } from '@utils/utils.array';
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
