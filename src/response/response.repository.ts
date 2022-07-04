import {
	EResponseErrorCode,
	IRepositoryFetchResponsesParams,
	IRepositoryUpsertResponseParams,
} from './response.interface';
import { ResponseDocument, ResponseModel, Response } from './schema';

import { AppError, FilterType } from '@utils/*';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseRepository {
	constructor(@InjectModel('Response') private readonly responseSchema: ResponseModel) {}

	async fetchResponses({
		questionnaireIds,
		responseIds,
	}: IRepositoryFetchResponsesParams): Promise<Response[]> {
		const query: FilterType<ResponseDocument> = {};
		if (questionnaireIds) query.questionnaire = { $in: questionnaireIds };
		if (responseIds) query._id = { $in: responseIds };

		return this.responseSchema
			.find(query)
			.lean()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EResponseErrorCode.FETCH_RESPONSES_ERROR,
					message: 'fail to fetch responses',
					originalError,
				});
			}) as Promise<Response[]>;
	}

	async create({
		questionnaireId,
		startedAt,
		answers,
	}: IRepositoryUpsertResponseParams): Promise<ResponseDocument> {
		return this.responseSchema
			.create({ answers, questionnaire: questionnaireId, startedAt })
			.catch((err: Error) => {
				throw new AppError({
					code: EResponseErrorCode.CREATE_RESPONSE_ERROR,
					message: 'fail to create new response',
					originalError: err,
				});
			}) as Promise<ResponseDocument>;
	}

	async save(response: ResponseDocument): Promise<ResponseDocument> {
		return response.save().catch((originalError: Error) => {
			throw new AppError({
				code: EResponseErrorCode.SAVE_RESPONSE_ERROR,
				message: 'fail to save response',
				originalError,
			});
		}) as Promise<ResponseDocument>;
	}

	async fetchById(responseId?: string): Promise<ResponseDocument | undefined> {
		if (!responseId) return;
		const response = (await this.responseSchema
			.findById(responseId)
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EResponseErrorCode.FETCH_RESPONSE_ERROR,
					message: 'fail to fetch response by id',
					originalError,
				});
			})) as ResponseDocument | null;
		return response ? response : undefined;
	}
}
