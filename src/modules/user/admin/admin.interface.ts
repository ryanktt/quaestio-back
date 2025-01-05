import { SessionDocument } from '@modules/session/session.schema';

import { AdminDocument } from './admin.schema';

export interface IAdminSignUpParams {
	userAgent: string;
	password: string;
	email: string;
	name: string;
	ip: string;
}

export interface IAdminSignInParams {
	userAgent: string;
	password: string;
	email: string;
	ip: string;
}

export interface ICreateAdminParams {
	hashedPassword: string;
	email: string;
	name: string;
}

export interface IAuthResponse {
	session: SessionDocument;
	user: AdminDocument;
	authToken: string;
}
