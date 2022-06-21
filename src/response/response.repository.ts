import { EResponseErrorCode, IRepositoryCreateResponseParams } from './response.interface';
import { ResponseDocument, ResponseModel } from './response.schema';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class ResponseRepository {
	constructor(@InjectModel('Response') private readonly responseSchema: ResponseModel) {}

	async create(params: IRepositoryCreateResponseParams): Promise<ResponseDocument> {
		const { answers, sharedId, questionnaireId, userId } = params;
		return this.responseSchema
			.create({ answers, sharedId, questionnaire: questionnaireId, user: userId })
			.catch((err: Error) => {
				throw new AppError({
					code: EResponseErrorCode.CREATE_RESPONSE_ERROR,
					message: 'fail to create new response',
					originalError: err,
				});
			}) as Promise<ResponseDocument>;
	}
}
