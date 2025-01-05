import { ESessionErrorCode, ICreateSessionParams, IUpdateSessionParams } from '@modules/session/session.interface';
import { SessionDocument, SessionModel } from '@modules/session/session.schema';
import { User, UserDocument, UserModel } from '@modules/user/user.schema';
import { EUserErrorCode } from '@modules/user/user.interface';
import { UtilsArray } from '@utils/utils.array';

import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import DataLoader from 'dataloader';

@Injectable()
export class UserSessionRepository {
	constructor(
		@InjectModel('Session') private readonly sessionSchema: SessionModel,
		@InjectModel('User') private readonly userSchema: UserModel,
		private readonly utilsArray: UtilsArray,
	) { }

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

	async updateSession(params: IUpdateSessionParams): Promise<SessionDocument> {
		const { session, active } = params;
		session.active = active;
		return session.save()
			.catch((err: Error) => {
				throw new AppError({
					code: ESessionErrorCode.UPDATE_SESSION_ERROR,
					message: 'fail to update session',
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

	async fetchUserByIds(userIds: string[]): Promise<User[]> {
		return this.userSchema
			.find({ _id: { $in: userIds } })
			.lean()
			.catch((err: Error) => {
				throw new AppError({
					code: EUserErrorCode.FETCH_USERS_ERROR,
					message: 'fail to fetch users by ids',
					originalError: err,
				});
			}) as Promise<User[]>;
	}

	userLoader(): DataLoader<string, User, string> {
		return new DataLoader<string, User>(async (ids: string[]) => {
			const users = await this.fetchUserByIds(ids);
			return this.utilsArray.getObjectsSortedByIds(users, '_id', ids);
		});
	}
}
