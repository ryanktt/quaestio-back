import { AppError, EGeneralErrorCode } from './utils.error';
import { UtilsPromise } from './utils.promise';
import { DocumentType } from './utils.schema';

import { Injectable } from '@nestjs/common';
import { LeanDocument } from 'mongoose';

type AnyObj = Record<string, unknown>;

@Injectable()
export class UtilsDoc {
	constructor(private readonly utilsPromise: UtilsPromise) {}

	async validateUserDocAccess<T extends DocumentType<AnyObj>, U extends DocumentType<AnyObj>>(
		docToVal: U | undefined,
		refDocsArr: { doc: T; refKey: keyof LeanDocument<U> }[],
	): Promise<void> {
		await this.utilsPromise.promisify(() => {
			if (!docToVal) return;
			refDocsArr.forEach(({ refKey, doc }) => {
				const docToValName = docToVal.constructor.modelName;

				if (docToVal[refKey] !== doc.id) {
					throw new AppError({
						message: `user does not have access to ${docToValName}`,
						code: EGeneralErrorCode.ACCESS_DENIED,
					});
				}
			});
		});
	}

	handleFieldUpdate<T extends DocumentType<AnyObj>, K extends keyof LeanDocument<T>>(params: {
		doc: T;
		field: K;
		value?: T[K] | null;
	}): T | undefined {
		const { doc, field, value } = params;
		if (value === null && doc[field] !== undefined) {
			doc[field] = undefined as typeof doc[typeof field];
			return doc;
		}
		if (value && typeof doc[field] === typeof value && doc[field] !== value) {
			doc[field] = value;
			return doc;
		}

		return;
	}
}
