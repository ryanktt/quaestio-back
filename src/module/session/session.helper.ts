import { SessionModel, ICreateSession, SessionDocument, ESessionErrorCode } from '@modules/session';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/utils.error';

@Injectable()
export class SessionHelper {
	constructor(
		@InjectModel('Session')
		private readonly sessionSchema: SessionModel,
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
}
