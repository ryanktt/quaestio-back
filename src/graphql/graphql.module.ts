/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IGraphqlContext } from './graphql.interface';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { isLocal } from 'src/app.module';
import { getClientIp } from 'request-ip';
import { Request } from 'express';

export default GraphQLModule.forRootAsync<ApolloDriverConfig>({
	driver: ApolloDriver,
	useFactory: () => ({
		autoSchemaFile: isLocal() ? 'schema.gql' : true,
		context: (context): IGraphqlContext => {
			const headers = context.req.headers as { 'user-agent': string; auth: string };
			const clientIp = getClientIp(context.req as Request) as string;
			console.log(isLocal())
			return {
				userAgent: headers['user-agent'],
				authToken: headers.auth,
				clientIp,
			};
		},
	}),
});
