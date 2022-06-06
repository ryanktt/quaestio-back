import { EUserErrorCode, IUserSignInParams, IUserSignInResponse, IUserSignUpParams } from './user.interface';
import { UserHelper } from './user.helper';
import { User } from './user.schema';

import { AppError } from 'src/utils/utils.error';
import { SessionShared } from '@modules/session';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
	constructor(private readonly sessionShared: SessionShared, private readonly userHelper: UserHelper) {}

	async fetch({ userId, email }: { userId?: string; email?: string }): Promise<User | null> {
		if (userId) return this.userHelper.fetchById(userId);
		if (email) return this.userHelper.fetchByEmail(email);
		return null;
	}

	async signUp({ name, email, password }: IUserSignUpParams): Promise<User> {
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

		if (await this.userHelper.fetchByEmail(email)) {
			throw new AppError({
				message: 'an user is already registered with given email',
				code: EUserErrorCode.USER_ALREADY_EXISTS,
			});
		}

		return this.userHelper.create({ hashedPassword, email: normalizedEmail, name });
	}

	async signIn({ email, password, ip, userAgent }: IUserSignInParams): Promise<IUserSignInResponse> {
		email = this.userHelper.normalizeEmail(email);

		const user = await this.userHelper.fetchByEmail(email);
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

		const sessionExpDate = this.sessionShared.getExpirationDate();
		const session = await this.sessionShared.create({
			expiresAt: sessionExpDate,
			userId: user.id,
			userAgent,
			ip,
		});

		const authToken = this.sessionShared.signJwtToken(
			{ userId: user.id, sessionId: session.id },
			sessionExpDate,
		);

		return { user, authToken };
	}
}
