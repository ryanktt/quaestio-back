import { AppError, EGeneralErrorCode } from './utils.error';
import { UtilsPromise } from './utils.promise';
import { DocumentType } from './utils.schema';

import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsAuth {
	constructor(private readonly utilsPromise: UtilsPromise) {}

	/** Asserts equality between mongo document id fields.
	 * Example: docToVal: questionnaire, refDocArray: [{doc: user, refKey: 'user}]
	 * This will assert that the user.id field is equal to the questionnaire.user field
	 */
	async validateUserDocAccess<T, U>(
		docToVal: DocumentType<U> | undefined,
		refDocsArr: { doc: DocumentType<T>; refKey: keyof DocumentType<U> }[],
	): Promise<void> {
		await this.utilsPromise.promisify(() => {
			if (!docToVal) return;
			refDocsArr.forEach(({ refKey, doc }) => {
				const docToValName = docToVal.constructor.modelName;

				if (docToVal[refKey] !== doc.id) {
					throw new AppError({
						message: `user does not have access to the ${docToValName} document`,
						code: EGeneralErrorCode.ACCESS_DENIED,
					});
				}
			});
		});
	}
}
