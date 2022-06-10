import { IJwtPayload } from './session.interface';
import { SessionModel } from './session.schema';

import { UtilsDate, UtilsPromise } from '@utils/*';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class SessionHelper {
	constructor(
		@InjectModel('Session') private readonly sessionSchema: SessionModel,
		private readonly utilsPromise: UtilsPromise,
		private readonly utilsDate: UtilsDate,
	) {}

	async validateAndGetJwtPayload(token: string): Promise<IJwtPayload> {
		return this.utilsPromise.promisify(() => jwt.verify(token, 'JWT Secret') as IJwtPayload);
	}

	signJwtToken(payload: IJwtPayload, expiresAt: Date): string {
		return jwt.sign(payload, 'JWT Secret', { expiresIn: this.utilsDate.getDateInMs(expiresAt) });
	}

	getExpirationDate(): Date {
		return this.utilsDate.addTimeToDate(new Date(), 'days', 2);
	}
}
