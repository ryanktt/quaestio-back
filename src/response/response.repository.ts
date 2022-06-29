import { EResponseErrorCode, IRepositoryCreateResponseParams } from './response.interface';
import { ResponseDocument, ResponseModel } from './schema';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class ResponseRepository {
	constructor(@InjectModel('Response') private readonly responseSchema: ResponseModel) {}

	async create({
		questionnaireId,
		attemptCount,
		startedAt,
		answers,
		userId,
	}: IRepositoryCreateResponseParams): Promise<ResponseDocument> {
		return this.responseSchema
			.create({ answers, questionnaire: questionnaireId, user: userId, attemptCount, startedAt })
			.catch((err: Error) => {
				throw new AppError({
					code: EResponseErrorCode.CREATE_RESPONSE_ERROR,
					message: 'fail to create new response',
					originalError: err,
				});
			}) as Promise<ResponseDocument>;
	}
}
