import { ESessionErrorCode, ICreateSessionParams } from '@modules/session/session.interface';
import { SessionDocument, SessionModel } from '@modules/session/session.schema';
import { UserDocument, UserModel } from '@modules/user/user.schema';
import { EUserErrorCode } from '@modules/user/user.interface';

import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserSessionRepository {
	constructor(
		@InjectModel('Session') private readonly sessionSchema: SessionModel,
		@InjectModel('User') private readonly userSchema: UserModel,
	) {}

	async createSession(params: ICreateSessionParams): Promise<SessionDocument> {
		const { expiresAt, ip, userId, userAgent, active } = params;
		return this.sessionSchema
			.create({ expiresAt, ip, user: userId, userAgent, active })
			.catch((err: Error) => {
				throw new AppError({
					code: ESessionErrorCode.CREATE_SESSION_ERROR,
					message: 'fail to create new session',
					originalError: err,
				});
			}) as Promise<SessionDocument>;
	}

	async fetchSessionById(sessionId: string): Promise<SessionDocument | undefined> {
		const session = (await this.sessionSchema
			.findById(sessionId)
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: ESessionErrorCode.FETCH_SESSION_ERROR,
					message: 'fail to fetch session',
					originalError: err,
				});
			})) as SessionDocument | null;
		return session ? session : undefined;
	}

	async fetchUserById(userId: string): Promise<UserDocument | undefined> {
		const user = (await this.userSchema
			.findById(userId)
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EUserErrorCode.FETCH_USER_ERROR,
					message: 'fail to fetch user',
					originalError: err,
				});
			})) as UserDocument | null;
		return user ? user : undefined;
	}
}
