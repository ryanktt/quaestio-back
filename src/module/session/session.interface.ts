import { registerEnumType } from '@nestjs/graphql';

export enum ESessionErrorCode {
	CREATE_SESSION_ERROR = 'CREATE_SESSION_ERROR',
}

registerEnumType(ESessionErrorCode, { name: 'SessionErrorCode' });

export interface ICreateSession {
	userAgent: string;
	expiresAt: Date;
	userId: string;
	ip: string;
	active?: boolean;
}
