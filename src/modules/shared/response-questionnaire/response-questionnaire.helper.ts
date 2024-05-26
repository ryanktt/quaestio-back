import { IJWTPublicPayload } from '@modules/session/session.interface';
import { IEnvirolmentVariables } from 'src/app.module';
import { UtilsPromise } from '@utils/utils.promise';
import { ConfigService } from '@nestjs/config';
import { UtilsDate } from '@utils/utils.date';
import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class ResponseQuestionnaireHelper {
	constructor(
		private readonly configService: ConfigService<IEnvirolmentVariables>,
		private readonly utilsPromise: UtilsPromise,
		private readonly utilsDate: UtilsDate,
	) {}

	JWT_SECRET = this.configService.get<string>('JWT_SECRET', 'jwtSecret');

	async validateAndGetJwtPublicPayload(token: string): Promise<IJWTPublicPayload> {
		return this.utilsPromise.promisify(() => jwt.verify(token, this.JWT_SECRET) as IJWTPublicPayload);
	}

	async getGuestRespondentJwtPayload(authToken?: string): Promise<IJWTPublicPayload | undefined> {
		if (!authToken) return;
		const payload = await this.validateAndGetJwtPublicPayload(authToken).catch((err) => console.error(err));
		return typeof payload === 'object' ? payload : undefined;
	}

	signPublicUpsertResponseToken(payload: IJWTPublicPayload, expiresAt?: Date): string {
		return jwt.sign({ ...payload }, this.JWT_SECRET, {
			...(expiresAt ? { expiresIn: this.utilsDate.getDateInMs(expiresAt) } : {}),
		});
	}
}
