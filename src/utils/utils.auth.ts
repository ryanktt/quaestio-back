import { AppError, EGeneralErrorCode } from './utils.error';
import { UtilsPromise } from './utils.promise';
import { DocumentType } from './utils.schema';

import { CustomDecorator, Injectable, SetMetadata } from '@nestjs/common';
import { EUserRole } from 'src/user';

export const Role = (role: keyof typeof EUserRole): CustomDecorator<string> => SetMetadata('role', role);

@Injectable()
export class UtilsAuth {
	constructor(private readonly utilsPromise: UtilsPromise) {}

	/**Asserts reference relations between documents */
	async validateUserDocAccess<T, U>(
		docToVal: DocumentType<U> | undefined,
		refDocsArr: { doc: DocumentType<T>; refKey: keyof DocumentType<U> }[],
	): Promise<void> {
		await this.utilsPromise.promisify(() => {
			if (!docToVal) return;
			refDocsArr.forEach(({ refKey, doc }) => {
				if (docToVal[refKey] !== doc.id) {
					throw new AppError({
						message: `user does not have access to this document`,
						code: EGeneralErrorCode.ACCESS_DENIED,
					});
				}
			});
		});
	}
}
