import {
	EResponseErrorCode,
	IRepositoryFetchResponseParams,
	IRepositoryFetchResponsesParams,
	IRepositoryUpsertResponseParams,
} from './response.interface';
import { ResponseDocument, ResponseModel, Response } from './schema';

import { ResponseQuestionnaireRepository } from '@modules/shared/response-questionnaire/response-questionnaire.repository';
import { FilterType } from '@utils/utils.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import mongoose, { ClientSession } from 'mongoose';
import { ObjectId } from 'mongodb';
import { escapeRegExp } from '@utils/utils.string';

@Injectable()
export class ResponseRepository {
	constructor(
		@InjectModel('Response') private readonly responseSchema: ResponseModel,
		private readonly responseQuestRepository: ResponseQuestionnaireRepository,
	) { }


	async buildMongoFetchResponsesQueryParams({
		questionnaireSharedIds,
		questionnaireIds,
		textFilter,
		responseIds,
		user,
	}: IRepositoryFetchResponsesParams): Promise<FilterType<ResponseDocument>> {
		const query: FilterType<ResponseDocument> = {};
		if (questionnaireIds) query.questionnaireSharedId = { $in: questionnaireSharedIds };
		if (questionnaireSharedIds) query.questionnaire = { $in: questionnaireIds };
		if (responseIds) query._id = { $in: responseIds };
		query.user = user._id;
		if (textFilter) {

			const questionnaireIds = (
				await this.responseQuestRepository.fetchQuestionnaires({ textFilter })
			).map((quest) => quest._id.toString());

			const escapedfilter = escapeRegExp(textFilter);
			query.$or = [
				{ questionnaireSharedId: { $regex: escapedfilter, $options: 'i' } },
				{ questionnaire: { $in: questionnaireIds } },
				{ respondentName: { $regex: escapedfilter, $options: 'i' } },
				{ respondentEmail: { $regex: escapedfilter, $options: 'i' } },
			];
			const isFilterId = mongoose.isValidObjectId(textFilter);
			if (isFilterId) {
				query.$or.push(
					{ '_id': textFilter },
					{ 'questionnaire': textFilter },
				);
			}
		}
		return query;
	}


	async fetchResponses(params: IRepositoryFetchResponsesParams): Promise<Response[]> {
		const query = await this.buildMongoFetchResponsesQueryParams(params);
		const limit = params.pagination?.limit;
		const page = params.pagination?.page;
		return this.responseSchema
			.find(query, null, limit && page ? { limit, skip: (page - 1) * limit } : {})
			.sort({ _id: -1 })
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

	async countResponses(params: IRepositoryFetchResponsesParams): Promise<number> {
		const query = await this.buildMongoFetchResponsesQueryParams(params);
		return this.responseSchema
			.find(query)
			.countDocuments()
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EResponseErrorCode.COUNT_RESPONSES_ERROR,
					message: 'fail to count responses',
					originalError,
				});
			});
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
		return response || undefined;
	}

	async fetchResponse({
		responseId,
	}: IRepositoryFetchResponseParams): Promise<ResponseDocument | undefined> {
		const response = (await this.responseSchema
			.findOne({ _id: new ObjectId(responseId) })
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EResponseErrorCode.FETCH_RESPONSE_ERROR,
					message: 'fail to fetch response',
					originalError,
				});
			})) as ResponseDocument | null;
		return response || undefined;
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
