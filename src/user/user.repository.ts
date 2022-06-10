import { EUserErrorCode, ICreateUserParams } from './user.interface';
import { UserDocument, UserModel } from './user.schema';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class UserRepository {
	constructor(@InjectModel('User') private readonly userSchema: UserModel) {}

	async fetchByIds(userIds: string[]): Promise<UserDocument[]> {
		return this.userSchema
			.find({ _id: { $in: userIds } })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EUserErrorCode.FETCH_USERS_ERROR,
					message: 'fail to fetch users by ids',
					originalError: err,
				});
			}) as Promise<UserDocument[]>;
	}

	async fetchById(userId: string): Promise<UserDocument | null> {
		return this.userSchema
			.findById(userId)
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EUserErrorCode.FETCH_USER_ERROR,
					message: 'fail to fetch user',
					originalError: err,
				});
			}) as Promise<UserDocument | null>;
	}

	async fetchByEmail(email: string): Promise<UserDocument | null> {
		return this.userSchema
			.findOne({ email })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EUserErrorCode.FETCH_USER_ERROR,
					message: 'fail to fetch user',
					originalError: err,
				});
			}) as Promise<UserDocument | null>;
	}

	async create({ name, email, hashedPassword }: ICreateUserParams): Promise<UserDocument> {
		return this.userSchema.create({ password: hashedPassword, email, name }).catch((err: Error) => {
			throw new AppError({
				code: EUserErrorCode.CREATE_USER_ERROR,
				message: 'fail to create user',
				originalError: err,
			});
		}) as Promise<UserDocument>;
	}
}
