import { IJwtPayload } from '@modules/session/session.interface';

import { IEnvirolmentVariables } from 'src/app.module';
import { ConfigService } from '@nestjs/config';
import { UtilsDate } from '@utils/utils.date';
import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class UserSessionHelper {
	constructor(
		private readonly configService: ConfigService<IEnvirolmentVariables>,
		private readonly utilsDate: UtilsDate,
	) {}

	JWT_SECRET = this.configService.get<string>('JWT_SECRET', 'jwtSecret');

	signJwtToken(payload: IJwtPayload, expiresAt?: Date): string {
		return jwt.sign(payload, this.JWT_SECRET, {
			expiresIn: expiresAt ? this.utilsDate.getDateInMs(expiresAt) : undefined,
		});
	}

	getExpirationDate(days = 2): Date {
		return this.utilsDate.addTimeToDate(new Date(), 'days', days);
	}
}
