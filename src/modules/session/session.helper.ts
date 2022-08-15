import { IJwtPayload, IJWTPublicPayload } from './session.interface';

import { UtilsDate, UtilsPromise } from '@utils/*';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class SessionHelper {
	constructor(
		private readonly configService: ConfigService,
		private readonly utilsPromise: UtilsPromise,
		private readonly utilsDate: UtilsDate,
	) {}

	JWT_SECRET = this.configService.get<string>('JWT_SECRET', 'jwtSecret');

	async validateAndGetJwtPayload(token: string): Promise<IJwtPayload> {
		return this.utilsPromise.promisify(() => jwt.verify(token, 'JWT Secret') as IJwtPayload);
	}

	async validateAndGetJwtPublicPayload(token: string): Promise<IJWTPublicPayload> {
		return this.utilsPromise.promisify(() => jwt.verify(token, 'JWT Secret') as IJWTPublicPayload);
	}

	signJwtToken(payload: IJwtPayload, expiresAt?: Date): string {
		return jwt.sign(payload, this.JWT_SECRET, {
			expiresIn: expiresAt ? this.utilsDate.getDateInMs(expiresAt) : undefined,
		});
	}

	signPublicUpsertResponseToken(payload: IJWTPublicPayload, expiresAt?: Date): string {
		return jwt.sign(payload, this.JWT_SECRET, {
			...(expiresAt ? { expiresIn: this.utilsDate.getDateInMs(expiresAt) } : {}),
		});
	}

	getExpirationDate(days = 2): Date {
		return this.utilsDate.addTimeToDate(new Date(), 'days', days);
	}
}
