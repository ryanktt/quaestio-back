import { ILoaders } from './graphql.data-loaders';

export interface IGraphqlContext {
	userAgent: string;
	authToken: string;
	clientIp: string;
	loaders: ILoaders;
}
