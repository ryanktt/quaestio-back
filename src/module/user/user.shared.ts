import { UserDocument, UserModel } from './user.schema';
import { EUserErrorCode } from './user.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class UserShared {
	constructor(@InjectModel('User') private readonly userSchema: UserModel) {}

	async fetchById(userId: string): Promise<UserDocument | null> {
		return this.userSchema.findById(userId).catch((err: Error) => {
			throw new AppError({
				code: EUserErrorCode.FETCH_USER_ERROR,
				message: 'fail to fetch user',
				originalError: err,
			});
		}) as Promise<UserDocument | null>;
	}
}
