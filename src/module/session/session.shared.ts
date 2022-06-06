import { ESessionErrorCode, ICreateSession, IJwtPayload } from './session.interface';
import { SessionDocument, SessionModel } from './session.schema';

import { AppError, UtilsDate } from '@utils/*';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class SessionShared {
	constructor(
		@InjectModel('Session') private readonly sessionSchema: SessionModel,
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

	signJwtToken(payload: IJwtPayload, expiresAt: Date): string {
		return jwt.sign(payload, 'JWT Secret', { expiresIn: this.utilsDate.getDateInMs(expiresAt) });
	}

	getExpirationDate(): Date {
		return this.utilsDate.addTimeToDate(new Date(), 'days', 2);
	}
}
