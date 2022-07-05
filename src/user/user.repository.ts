import { UserModel, UserDocument, User } from './user.schema';
import { EUserErrorCode } from './user.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class UserRepository {
	constructor(@InjectModel('User') private readonly userSchema: UserModel) {}

	async fetchById(userId: string): Promise<UserDocument | undefined> {
		const user = (await this.userSchema
			.findById(userId)
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EUserErrorCode.FETCH_USER_ERROR,
					message: 'fail to fetch user',
					originalError: err,
				});
			})) as UserDocument | null;
		return user ? user : undefined;
	}

	async fetchByIds(userIds: string[]): Promise<User[]> {
		return this.userSchema
			.find({ _id: { $in: userIds } })
			.lean()
			.catch((err: Error) => {
				throw new AppError({
					code: EUserErrorCode.FETCH_USERS_ERROR,
					message: 'fail to fetch users by ids',
					originalError: err,
				});
			}) as Promise<User[]>;
	}

	async fetchByEmail(email: string): Promise<UserDocument | undefined> {
		const user = (await this.userSchema
			.findOne({ email })
			.exec()
			.catch((err: Error) => {
				throw new AppError({
					code: EUserErrorCode.FETCH_USER_ERROR,
					message: 'fail to fetch user',
					originalError: err,
				});
			})) as UserDocument | null;
		return user ? user : undefined;
	}
}
