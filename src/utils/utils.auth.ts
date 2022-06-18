import { AppError, EGeneralErrorCode } from './utils.error';
import { UtilsPromise } from './utils.promise';

import { CustomDecorator, Injectable, SetMetadata } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose';
import { EUserRole, UserDocument } from 'src/user';

export const Role = (role: keyof typeof EUserRole): CustomDecorator<string> => SetMetadata('role', role);

@Injectable()
export class UtilsAuth {
	constructor(private readonly utilsPromise: UtilsPromise) {}

	async validateUserDocsAccess<T>(user: UserDocument, docs: DocumentType<T>[]): Promise<void> {
		await this.utilsPromise.promisify(() => {
			if (docs.some((doc) => doc.id !== user.id)) {
				throw new AppError({
					message: 'user does not have access to this document',
					code: EGeneralErrorCode.ACCESS_DENIED,
				});
			}
		});
	}
}
