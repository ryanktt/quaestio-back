import { ESessionErrorCode, IUpdateSessionParams } from './session.interface';
import { SessionDocument, SessionModel } from './session.schema';

import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionRepository {
	constructor(@InjectModel('Session') private readonly sessionSchema: SessionModel) {}

	async fetchById(sessionId: string): Promise<SessionDocument | undefined> {
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

	async update({ active, session }: IUpdateSessionParams): Promise<SessionDocument> {
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
}
