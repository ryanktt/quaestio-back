import { IJwtPayload, IJWTPublicPayload } from './session.interface';

import { IEnvirolmentVariables } from 'src/app.module';
import { UtilsPromise } from '@utils/utils.promise';
import { ConfigService } from '@nestjs/config';
import { UtilsDate } from '@utils/utils.date';
import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class SessionHelper {
	constructor(
		private readonly configService: ConfigService<IEnvirolmentVariables>,
		private readonly utilsPromise: UtilsPromise,
		private readonly utilsDate: UtilsDate,
	) {}

	JWT_SECRET = this.configService.get<string>('JWT_SECRET', 'jwtSecret');

	async validateAndGetJwtPayload(token: string): Promise<IJwtPayload> {
		return this.utilsPromise.promisify(() => jwt.verify(token, this.JWT_SECRET) as IJwtPayload);
	}

	async validateAndGetJwtPublicPayload(token: string): Promise<IJWTPublicPayload> {
		return this.utilsPromise.promisify(() => jwt.verify(token, this.JWT_SECRET) as IJWTPublicPayload);
	}

	signJwtToken(payload: IJwtPayload, expiresAt?: Date): string {
		return jwt.sign(payload, this.JWT_SECRET, {
			expiresIn: expiresAt ? this.utilsDate.getDateInMs(expiresAt) : undefined,
		});
	}

	getExpirationDate(days = 2): Date {
		return this.utilsDate.addTimeToDate(new Date(), 'days', days);
	}
}
