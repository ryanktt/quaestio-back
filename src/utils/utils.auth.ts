import { AppError, EGeneralErrorCode } from './utils.error';
import { UtilsPromise } from './utils.promise';
import { DocumentType } from './utils.schema';

import { Injectable } from '@nestjs/common';

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
				const docToValName = (docToVal.constructor as unknown as { modelName: string }).modelName;

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
