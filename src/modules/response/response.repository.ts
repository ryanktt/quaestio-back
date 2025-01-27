import {
	EResponseErrorCode,
	IRepositoryFetchResponseParams,
	IRepositoryFetchResponsesParams,
	IRepositoryUpsertResponseParams,
} from './response.interface';
import { ResponseDocument, ResponseModel, Response } from './schema';

import { FilterType } from '@utils/utils.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class ResponseRepository {
	constructor(@InjectModel('Response') private readonly responseSchema: ResponseModel) { }

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
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EResponseErrorCode.FETCH_RESPONSES_ERROR,
					message: 'fail to fetch responses',
					originalError,
				});
			}) as Promise<Response[]>;
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

	async fetchResponse({
		questionnaireId,
		responseId,
	}: IRepositoryFetchResponseParams): Promise<ResponseDocument> {
		return this.responseSchema
			.findOne({ _id: new ObjectId(responseId), questionnaire: new ObjectId(questionnaireId) })
			.lean()
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EResponseErrorCode.FETCH_RESPONSE_ERROR,
					message: 'fail to fetch response',
					originalError,
				});
			}) as Promise<ResponseDocument>;
	}

	async create(
		{ questionnaireId, startedAt, answers }: IRepositoryUpsertResponseParams,
		session?: ClientSession,
	): Promise<ResponseDocument> {
		const response = new this.responseSchema({ answers, questionnaire: questionnaireId, startedAt });
		return response.save({ session }).catch((err: Error) => {
			throw new AppError({
				code: EResponseErrorCode.CREATE_RESPONSE_ERROR,
				message: 'fail to create new response',
				originalError: err,
			});
		}) as Promise<ResponseDocument>;
	}

	async save(response: ResponseDocument, session?: ClientSession): Promise<ResponseDocument> {
		return response.save({ session }).catch((originalError: Error) => {
			throw new AppError({
				code: EResponseErrorCode.SAVE_RESPONSE_ERROR,
				message: 'fail to save response',
				originalError,
			});
		}) as Promise<ResponseDocument>;
	}
}
