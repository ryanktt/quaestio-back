import { registerEnumType } from '@nestjs/graphql';

export enum ERespondentErrorCode {
	CREATE_RESPONDENT_ERROR = 'CREATE_RESPONDENT_ERROR',
	FETCH_RESPONDENT_ERROR = 'FETCH_RESPONDENT_ERROR',
	RESPONDENT_NOT_FOUND = 'RESPONDENT_NOT_FOUND',
}

registerEnumType(ERespondentErrorCode, { name: 'RespondentErrorCode' });

export interface IRespondentLocation {
	timezone: string;
	country: string;
	state: string;
	city: string;
}

export interface ICreateRespondentParams {
	location: IRespondentLocation;
	userAgent: string;
	email: string;
	name: string;
	ip: string;
}

export interface ISignInRespondentParams {
	userAgent: string;
	email: string;
	name: string;
	ip: string;
}
