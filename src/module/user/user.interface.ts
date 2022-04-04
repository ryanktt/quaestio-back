import { registerEnumType } from '@nestjs/graphql';

export enum EUserErrorCode {
	USER_SIGNUP_INVALID_PARAMS = 'USER_SIGNUP_INVALID_PARAMS',
	INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
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

export interface IUserSignUp {
	phoneNumber?: string;
	password: string;
	email: string;
	name: string;
}

export interface ICreateUser {
	phoneNumber?: string;
	password: string;
	email: string;
	name: string;
}
