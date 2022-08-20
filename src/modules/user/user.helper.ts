import { EUserErrorCode } from './user.interface';

import PasswordValidator from 'password-validator';
import { UtilsPromise } from '@utils/utils.promise';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import validator from 'validator';

@Injectable()
export class UserHelper {
	constructor(private readonly utilsPromise: UtilsPromise) {}
	async getPasswordHash(password: string): Promise<string> {
		return hash(password, 12).catch((err) => {
			throw new AppError({
				originalError: err instanceof Error ? err : undefined,
				code: EUserErrorCode.PASSWORD_HASH_ERROR,
				message: 'fail to hash password',
			});
		});
	}

	async comparePassword({ password, hash }: { password: string; hash: string }): Promise<boolean> {
		return compare(password, hash).catch((err: Error) => {
			throw new AppError({
				originalError: err instanceof Error ? err : undefined,
				code: EUserErrorCode.PASSWORD_HASH_ERROR,
				message: 'fail to compare password hash',
			});
		});
	}

	async validatePasswordStrength(password: string): Promise<void> {
		return this.utilsPromise.promisify(() => {
			const schema = new PasswordValidator();
			schema.is().min(4).is().max(100).has().uppercase();
			const passwordValid = schema.validate(password, { details: true });
			if (Array.isArray(passwordValid) && passwordValid.length > 0) {
				throw new AppError({
					code: EUserErrorCode.INVALID_PASSWORD,
					message: 'password is invalid',
					payload: passwordValid,
				});
			}
		});
	}

	normalizeEmail(email: string): string {
		return (validator.normalizeEmail(email) as string).trim();
	}

	async validateName(name: string): Promise<void> {
		return this.utilsPromise.promisify(() => {
			const code = EUserErrorCode.INVALID_NAME;
			if (name.length < 3) throw new AppError({ message: 'invalid name, min character length: 3', code });
			if (name.length > 255) throw new AppError({ message: 'invalid name, max character length: 255', code });
		});
	}

	async validateEmail(email: string): Promise<void> {
		return this.utilsPromise.promisify(() => {
			if (!validator.isEmail(email))
				throw new AppError({ code: EUserErrorCode.INVALID_EMAIL, message: 'invalid email' });
		});
	}
}
