import { CustomDecorator, Injectable, SetMetadata } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose';
import { EUserRole, UserDocument } from 'src/user';
import { AppError, EGeneralErrorCode } from './utils.error';

export const Role = (role: keyof typeof EUserRole): CustomDecorator<string> => SetMetadata('role', role);

@Injectable()
export class UtilsAuth {
	validateUserDocsAccess<T>(user: UserDocument, docs: DocumentType<T>[]): void {
		if (docs.some((doc) => doc.id !== user.id)) {
			throw new AppError({
				message: 'user does not have access to this document',
				code: EGeneralErrorCode.ACCESS_DENIED,
			});
		}
	}
}
