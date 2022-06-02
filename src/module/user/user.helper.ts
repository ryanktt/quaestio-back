import { ICreateUserParams, EUserErrorCode } from './user.interface';
import PasswordValidator from 'password-validator';
import { IJwtPayload } from '@utils/utils.auth';
import { InjectModel } from '@nestjs/mongoose';
import { UtilsDate } from '@utils/utils.date';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { User } from './user.schema';
import { Promise } from 'bluebird';
import validator from 'validator';
import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';

@Injectable()
export class UserHelper {
	constructor(
		@InjectModel('User')
		private readonly userSchema: Model<User>,
		private readonly utilsDate: UtilsDate,
	) {}

	async fetchUsers(): Promise<User[]> {
		return this.userSchema.find({});
	}

	async fetchById(userId: string): Promise<User | null> {
		return this.userSchema.findById(userId).catch((err: Error) => {
			throw new AppError({
				code: EUserErrorCode.FETCH_USER_ERROR,
				message: 'fail to fetch user',
				originalError: err,
			});
		});
	}

	async fetchByEmail(email: string): Promise<User | null> {
		return this.userSchema.findOne({ email }).catch((err: Error) => {
			throw new AppError({
				code: EUserErrorCode.FETCH_USER_ERROR,
				message: 'fail to fetch user',
				originalError: err,
			});
		});
	}

	async create({ name, email, hashedPassword }: ICreateUserParams): Promise<User> {
		return this.userSchema.create({ password: hashedPassword, email, name }).catch((err: Error) => {
			throw new AppError({
				code: EUserErrorCode.CREATE_USER_ERROR,
				message: 'fail to create user',
				originalError: err,
			});
		});
	}

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
		await new Promise((resolve): void => {
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
			resolve();
		});
	}

	normalizeEmail(email: string): string {
		return (validator.normalizeEmail(email) as string).trim();
	}

	async validateName(name: string): Promise<void> {
		await new Promise((resolve): void => {
			const code = EUserErrorCode.INVALID_NAME;
			if (name.length < 3) throw new AppError({ message: 'invalid name, min character length: 3', code });
			if (name.length > 255) throw new AppError({ message: 'invalid name, max character length: 255', code });
			resolve();
		});
	}
	async validateEmail(email: string): Promise<void> {
		await new Promise((resolve): void => {
			if (!validator.isEmail(email))
				throw new AppError({ code: EUserErrorCode.INVALID_EMAIL, message: 'invalid email' });
			resolve();
		});
	}

	signJwtToken(payload: IJwtPayload): string {
		const twoDaysFromNow = this.utilsDate.addTimeToDate(new Date(), 'days', 2);
		return jwt.sign(payload, 'JWT Secret', { expiresIn: this.utilsDate.getDateInMs(twoDaysFromNow) });
	}
}
