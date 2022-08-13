/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { QuestionnaireModule, QuestionnaireRepository } from '@modules/questionnaire';
import { UserRepository, UserModule } from '@modules/user';
import { UtilsArray, UtilsModule } from '@utils/*';
import { loaders } from './graphql.data-loaders';
import { getClientIp } from 'request-ip';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { IGraphqlContext } from './graphql.interface';
import { GraphQLModule } from '@nestjs/graphql';
import { Request } from 'express';

export default GraphQLModule.forRootAsync<ApolloDriverConfig>({
	driver: ApolloDriver,
	useFactory: (
		utilsArray: UtilsArray,
		userRepository: UserRepository,
		questionnaireRepository: QuestionnaireRepository,
	) => ({
		autoSchemaFile: 'schema.gql',
		context: (context): IGraphqlContext => {
			const headers = context.req.headers as { 'user-agent': string; auth: string };
			const clientIp = getClientIp(context.req as Request) as string;

			return {
				loaders: loaders(utilsArray, userRepository, questionnaireRepository),
				userAgent: headers['user-agent'],
				authToken: headers.auth,
				clientIp,
			};
		},
	}),
	inject: [UtilsArray, UserRepository, QuestionnaireRepository],
	imports: [UtilsModule, UserModule, QuestionnaireModule],
});
