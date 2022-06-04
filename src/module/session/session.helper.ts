import { SessionModel, ICreateSession, SessionDocument, ESessionErrorCode } from '@modules/session';
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

	async createSession(params: ICreateSession): Promise<SessionDocument> {
		return this.sessionSchema.create(params).catch((err: Error) => {
			throw new AppError({
				code: ESessionErrorCode.CREATE_SESSION_ERROR,
				message: 'fail to create new session',
				originalError: err,
			});
		}) as Promise<SessionDocument>;
	}

	getSessionExpirationDate(): Date {
		return this.utilsDate.addTimeToDate(new Date(), 'days', 2);
	}
}
