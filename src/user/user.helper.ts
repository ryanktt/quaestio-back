import { ICreateUser, EUserErrorCode } from './user.interface';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { AppError } from '../utils/utils.error'; // TODO fix this
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { Promise } from 'bluebird';
import validator from 'validator';
import { Model } from 'mongoose';

@Injectable()
export class UserHelper {
	constructor(
		@InjectModel('User')
		private readonly userSchema: Model<User>,
	) {}

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

	async create({ name, email, phoneNumber }: ICreateUser): Promise<User> {
		return this.userSchema.create({ phoneNumber, email, name }).catch((err: Error) => {
			throw new AppError({
				code: EUserErrorCode.CREATE_USER_ERROR,
				message: 'fail to create user',
				originalError: err,
			});
		});
	}

	normalizeEmail(email: string): string {
		return (validator.normalizeEmail(email) as string).trim();
	}

	normalizePhoneNumber(phoneNumber?: string): string | undefined {
		if (!phoneNumber) return;
		return parsePhoneNumber(phoneNumber).number;
	}

	async validateName(name: string): Promise<void> {
		await new Promise((): void => {
			const code = EUserErrorCode.INVALID_NAME;
			if (name.length < 3) throw new AppError({ message: 'invalid name, min character length: 3', code });
			if (name.length > 255) throw new AppError({ message: 'invalid name, max character length: 255', code });
		});
	}
	async validateEmail(email: string): Promise<void> {
		await new Promise((): void => {
			if (!validator.isEmail(email)) {
				throw new AppError({
					code: EUserErrorCode.INVALID_EMAIL,
					message: 'invalid email',
				});
			}
		});
	}

	async validatePhoneNumber(phoneNumber?: string): Promise<void> {
		if (!phoneNumber) return;
		await new Promise((): void => {
			if (!isValidPhoneNumber(phoneNumber)) {
				throw new AppError({
					code: EUserErrorCode.INVALID_PHONE_NUMBER,
					message: 'invalid phone number',
				});
			}
		});
	}
}
