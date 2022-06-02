import { registerEnumType } from '@nestjs/graphql';
import { User } from './user.schema';

export enum EUserErrorCode {
	USER_SIGNUP_INVALID_PARAMS = 'USER_SIGNUP_INVALID_PARAMS',
	PASSWORD_HASH_ERROR = 'PASSWORD_HASH_ERROR',
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
	CREATE_USER_ERROR = 'CREATE_USER_ERROR',
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

export interface ICreateUserParams {
	hashedPassword: string;
	email: string;
	name: string;
}

export interface IUserSignInResponse {
	authToken: string;
	user: User;
}
