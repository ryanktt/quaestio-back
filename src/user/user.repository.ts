import { UserModel, UserDocument } from './user.schema';
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
}
