import { AdminDocument } from './admin.schema';

import { SessionDocument } from 'src/session';

export interface IAdminSignUpParams {
	password: string;
	email: string;
	name: string;
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

export interface IAdminSignInResponse {
	session: SessionDocument;
	user: AdminDocument;
	authToken: string;
}
