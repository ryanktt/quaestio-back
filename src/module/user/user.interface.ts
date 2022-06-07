import { UserDocument } from './user.schema';

import { registerEnumType } from '@nestjs/graphql';
import { SessionDocument } from '@modules/session';

export enum EUserErrorCode {
	USER_SIGNUP_INVALID_PARAMS = 'USER_SIGNUP_INVALID_PARAMS',
	PASSWORD_HASH_ERROR = 'PASSWORD_HASH_ERROR',
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
	CREATE_USER_ERROR = 'CREATE_USER_ERROR',
	FETCH_USERS_ERROR = 'FETCH_USERS_ERROR',
	INVALID_PASSWORD = 'INVALID_PASSWORD',
	FETCH_USER_ERROR = 'FETCH_USER_ERROR',
	USER_NOT_FOUND = 'USER_NOT_FOUND',
	INVALID_EMAIL = 'INVALID_EMAIL',
	INVALID_NAME = 'INVALID_NAME',
}

registerEnumType(EUserErrorCode, { name: 'UserErrorCode' });

export interface IUserSignUpParams {
	password: string;
	email: string;
	name: string;
}

export interface IUserSignInParams {
	userAgent: string;
	password: string;
	email: string;
	ip: string;
}

export interface ICreateUserParams {
	hashedPassword: string;
	email: string;
	name: string;
}

export interface IUserSignInResponse {
	session: SessionDocument;
	user: UserDocument;
	authToken: string;
}
