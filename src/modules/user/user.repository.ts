import { UserModel, UserDocument } from './user.schema';
import { EUserErrorCode } from './user.interface';

import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';

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
