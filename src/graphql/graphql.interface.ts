export interface IGraphqlContext {
	userAgent: string;
	clientIp: string;
	respondentToken?: string;
	authToken?: string;
}
