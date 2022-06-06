import { SessionDocument } from './session.schema';

import { registerEnumType } from '@nestjs/graphql';

export enum ESessionErrorCode {
	SESSION_IS_NOT_ACTIVE = 'SESSION_IS_NOT_ACTIVE',
	CREATE_SESSION_ERROR = 'CREATE_SESSION_ERROR',
	UPDATE_SESSION_ERROR = 'UPDATE_SESSION_ERROR',
	FETCH_SESSION_ERROR = 'FETCH_SESSION_ERROR',
	SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
	SESSION_EXPIRED = 'SESSION_EXPIRED',
	INVALID_SESSION = 'INVALID_SESSION',
}

registerEnumType(ESessionErrorCode, { name: 'SessionErrorCode' });

export interface ICreateSession {
	userAgent: string;
	expiresAt: Date;
	userId: string;
	ip: string;
	active?: boolean;
}

export interface IUpdateSession {
	session: SessionDocument;
	active: boolean;
}

export interface IJwtPayload {
	sessionId: string;
	userId: string;
}
