import { registerEnumType } from '@nestjs/graphql';
export * from './respondent/respondent.interface';
export * from './admin/admin.interface';

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
export enum EUserRole {
	Respondent = 'Respondent',
	Admin = 'Admin',
	User = 'User',
}

registerEnumType(EUserErrorCode, { name: 'UserErrorCode' });
registerEnumType(EUserRole, { name: 'UserType' });
