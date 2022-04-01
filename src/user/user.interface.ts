import { registerEnumType } from '@nestjs/graphql';

export enum UserErrorCodeEnum {
	'USER:SIGNUP:INVALID_PARAMS' = 'USER:SIGNUP:INVALID_PARAMS',
	'USER:SIGNIN:INVALID_PARAMS' = 'USER:SIGNIN:INVALID_PARAMS',
}

registerEnumType(UserErrorCodeEnum, { name: 'UserErrorCode' });
