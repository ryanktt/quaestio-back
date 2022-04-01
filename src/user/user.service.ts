import { IUserSignUp, EUserErrorCode } from './user.interface';
import { AppError } from '../utils/utils.error'; // TODO fix this
import { Injectable } from '@nestjs/common';
import { UserHelper } from './user.helper';
import { User } from './user.schema';

@Injectable()
export class UserService {
	constructor(private readonly userHelper: UserHelper) {}

	async fetch({ userId, email }: { userId?: string; email?: string }): Promise<User | null> {
		if (userId) return this.userHelper.fetchById(userId);
		if (email) return this.userHelper.fetchByEmail(email);
		return null;
	}

	async signUp({ name, email, phoneNumber }: IUserSignUp): Promise<User> {
		const errCollector = AppError.collectorInstance();

		this.userHelper.normalizeEmail(email);
		await this.userHelper.validateName(name).catch((err: Error) => {
			return errCollector.collect(err);
		});
		await this.userHelper.validateEmail(email).catch((err: Error) => {
			return errCollector.collect(err);
		});
		await this.userHelper.validatePhoneNumber(phoneNumber).catch((err: Error) => {
			return errCollector.collect(err);
		});

		errCollector.run({
			message: 'invalid params to sign up new user',
			code: EUserErrorCode.USER_SIGNUP_INVALID_PARAMS,
		});

		const normalizePhoneNumber = this.userHelper.normalizePhoneNumber(phoneNumber);

		if (await this.userHelper.fetchByEmail(email)) {
			throw new AppError({
				message: 'user already registered with given email',
				code: EUserErrorCode.USER_ALREADY_EXISTS,
			});
		}

		return this.userHelper.create({ name, email, phoneNumber: normalizePhoneNumber });
	}
}
