import { SessionModel, ICreateSession, SessionDocument, ESessionErrorCode } from '@modules/session';
import { IUpdateSession } from './session.interface';
import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { UtilsDate } from '@utils/utils.date';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionHelper {
	constructor(
		@InjectModel('Session')
		private readonly sessionSchema: SessionModel,
		private readonly utilsDate: UtilsDate,
	) {}

	async fetchById(sessionId: string): Promise<SessionDocument | null> {
		return this.sessionSchema.findById(sessionId).catch((err: Error) => {
			throw new AppError({
				code: ESessionErrorCode.FETCH_SESSION_ERROR,
				message: 'fail to fetch session',
				originalError: err,
			});
		}) as Promise<SessionDocument | null>;
	}

	async create(params: ICreateSession): Promise<SessionDocument> {
		return this.sessionSchema.create(params).catch((err: Error) => {
			throw new AppError({
				code: ESessionErrorCode.CREATE_SESSION_ERROR,
				message: 'fail to create new session',
				originalError: err,
			});
		}) as Promise<SessionDocument>;
	}

	async update({ active, session }: IUpdateSession): Promise<SessionDocument> {
		if (active === session.active) return session;
		session.active = active;

		return session.save().catch((err: Error) => {
			throw new AppError({
				code: ESessionErrorCode.UPDATE_SESSION_ERROR,
				message: 'fail to update session',
				originalError: err,
			});
		}) as Promise<SessionDocument>;
	}

	getExpirationDate(): Date {
		return this.utilsDate.addTimeToDate(new Date(), 'days', 2);
	}
}
