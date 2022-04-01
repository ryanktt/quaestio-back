import { registerEnumType } from '@nestjs/graphql';

export enum EUserErrorCode {
	USER_SIGNUP_INVALID_PARAMS = 'USER_SIGNUP_INVALID_PARAMS',
	INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
	USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
	CREATE_USER_ERROR = 'CREATE_USER_ERROR',
	INVALID_PASSWORD = 'INVALID_PASSWORD',
	FETCH_USER_ERROR = 'FETCH_USER_ERROR',
	INVALID_EMAIL = 'INVALID_EMAIL',
	INVALID_NAME = 'INVALID_NAME',
}

registerEnumType(EUserErrorCode, { name: 'UserErrorCode' });

export interface IUserSignUp {
	phoneNumber?: string;
	email: string;
	name: string;
}

export interface ICreateUser {
	phoneNumber?: string;
	email: string;
	name: string;
}
