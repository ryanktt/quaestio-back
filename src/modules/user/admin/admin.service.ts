import { IAdminSignInParams, IAdminSignInResponse, IAdminSignUpParams } from './admin.interface';
import { AdminRepository } from './admin.repository';
import { EUserErrorCode } from '../user.interface';
import { AdminDocument } from './admin.schema';
import { UserHelper } from '../user.helper';

import { UserSessionRepository } from '@modules/shared/user-session/user-session.repository';
import { UserSessionHelper } from '@modules/shared/user-session/user-session.helper';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
	constructor(
		private readonly userSessionRepository: UserSessionRepository,
		private readonly userSessionHelper: UserSessionHelper,
		private readonly adminRepository: AdminRepository,
		private readonly userHelper: UserHelper,
	) {}

	async fetch({ userId, email }: { userId?: string; email?: string }): Promise<AdminDocument | undefined> {
		if (userId) return this.adminRepository.fetchById(userId);
		if (email) return this.adminRepository.fetchByEmail(email);
		return undefined;
	}

	async signUp({ name, email, password }: IAdminSignUpParams): Promise<AdminDocument> {
		const errCollector = AppError.collectorInstance();

		const normalizedEmail = this.userHelper.normalizeEmail(email);
		await this.userHelper.validatePasswordStrength(password).catch((err: Error) => {
			return errCollector.collect(err);
		});

		await this.userHelper.validateEmail(normalizedEmail).catch((err: Error) => {
			return errCollector.collect(err);
		});

		await this.userHelper.validateName(name).catch((err: Error) => {
			return errCollector.collect(err);
		});

		errCollector.run({
			message: 'invalid params to sign up new user',
			code: EUserErrorCode.USER_SIGNUP_INVALID_PARAMS,
		});

		const hashedPassword = await this.userHelper.getPasswordHash(password);

		if (await this.adminRepository.fetchByEmail(email)) {
			throw new AppError({
				message: 'an user is already registered with given email',
				code: EUserErrorCode.USER_ALREADY_EXISTS,
			});
		}

		return this.adminRepository.create({ hashedPassword, email: normalizedEmail, name });
	}

	async signIn({ email, password, ip, userAgent }: IAdminSignInParams): Promise<IAdminSignInResponse> {
		email = this.userHelper.normalizeEmail(email);

		const user = await this.adminRepository.fetchByEmail(email);
		if (!user) {
			throw new AppError({
				code: EUserErrorCode.USER_NOT_FOUND,
				message: 'no user was found with given email',
			});
		}

		if (!(await this.userHelper.comparePassword({ password, hash: user.password }))) {
			throw new AppError({
				code: EUserErrorCode.INVALID_CREDENTIALS,
				message: 'invalid credentials to sign in',
			});
		}

		const sessionExpDate = this.userSessionHelper.getExpirationDate();
		const session = await this.userSessionRepository.createSession({
			expiresAt: sessionExpDate,
			userId: user.id,
			userAgent,
			ip,
		});

		const authToken = this.userSessionHelper.signJwtToken(
			{ userId: user.id, sessionId: session.id },
			sessionExpDate,
		);

		return { user, session, authToken };
	}
}
