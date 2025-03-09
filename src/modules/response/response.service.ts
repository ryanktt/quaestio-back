import {
	EResponseErrorCode,
	IFetchResponseParams,
	IFetchResponsesParams,
	IPublicUpsertQuestResponseParams,
	IResponseCorrection,
} from './response.interface';
import { AnswerTypes, Response } from './schema';
import { ResponseHelper } from './response.helper';

import { ResponseQuestionnaireRepository } from '@modules/shared/response-questionnaire/response-questionnaire.repository';
import { ResponseQuestionnaireHelper } from '@modules/shared/response-questionnaire/response-questionnaire.helper';
import { EQuestionnaireErrorCode } from '@modules/questionnaire/questionnaire.interface';
import { ResponseRepository } from './response.repository';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import { isLocal } from 'src/app.module';
import { ObjectId } from 'mongodb';
import { PaginatedResponseResponse } from './response.resolver';



@Injectable()
export class ResponseService {
	constructor(
		private readonly responseQuestionnaireRepo: ResponseQuestionnaireRepository,
		private readonly responseQuestionnaireHelper: ResponseQuestionnaireHelper,
		private readonly responseRepository: ResponseRepository,
		private readonly responseHelper: ResponseHelper,

	) { }

	async adminFetchResponse(params: IFetchResponseParams): Promise<Response | undefined> {
		return this.responseRepository.fetchResponse(params).then((res) => {
			return res?.user.toString() === params.user._id.toString() ? res : undefined;
		});
	}

	async adminFetchResponses(params: IFetchResponsesParams): Promise<PaginatedResponseResponse> {
		await this.responseHelper.validateFetchResponsesParams(params);
		const { limit, page } = params.pagination;

		const [results, totalResponseCount] = await Promise.all([
			this.responseRepository.fetchResponses(params),
			this.responseRepository.countResponses(params),
		]);

		const totalPageCount = Math.ceil(totalResponseCount / limit);
		return {
			results,
			totalPageCount,
			currentPage: page,
			hasNextPage: page < totalPageCount,
			totalResultCount: totalResponseCount,
		};
	}

	async publicUpsertQuestionnaireResponse(
		params: IPublicUpsertQuestResponseParams,
	): Promise<{ respondentToken: string; correction: IResponseCorrection }> {
		await this.responseHelper.validatePublicUpsertResponseParams(params);
		const {
			answers: answerDiscriminatorArray,
			questionnaireId,
			completedAt,
			startedAt,
			userAgent,
			email,
			name,
			ip,
		} = params;

		const questionnaire = await this.responseQuestionnaireRepo.fetchQuestionnaireById(questionnaireId);
		if (!questionnaire) {
			throw new AppError({
				code: EQuestionnaireErrorCode.QUESTIONNAIRE_NOT_FOUND,
				message: 'questionnaire not found'
			});
		}

		const errCollector = AppError.collectorInstance();

		const answers = answerDiscriminatorArray.map((input) => {
			return this.responseHelper.getAnswerFromAnswerDiscriminatorInput(input) as AnswerTypes;
		});

		if (questionnaire.requireEmail && !email) {
			errCollector.collect(new AppError({
				code: EResponseErrorCode.MISSING_REQUIRED_FIELDS,
				message: 'email is required but it was not provided'
			}));
		}
		if (questionnaire.requireName && !name) {
			errCollector.collect(new AppError({
				code: EResponseErrorCode.MISSING_REQUIRED_FIELDS,
				message: 'name is required but it was not provided'
			}));
		}

		try {
			this.responseHelper.validateAnswers({ answers, questionnaire });
		} catch (error: unknown) {
			errCollector.collect(error as AppError);
		}

		this.responseHelper.correctAnswers({ answers, questionnaire });
		errCollector.run({
			message: 'invalid params to upsert questionnaire response',
			code: EResponseErrorCode.CREATE_RESPONSE_INVALID_PARAMS,
		});

		let respondentToken = params.respondentToken;
		if (!params.respondentToken) {
			const respondentId = new ObjectId().toString();
			respondentToken = this.responseQuestionnaireHelper.signPublicUpsertResponseToken({ respondentId });
		}
		if (isLocal()) {
			await this.responseHelper.invokeUpsertQuestionnaireResponseLambda({
				respondentToken,
				questionnaireId,
				completedAt,
				startedAt,
				userAgent,
				answers,
				email,
				name,
				ip,
			});
		} else {
			await this.responseHelper.sendQuestionnaireResponseToSQS({
				respondentToken,
				questionnaireId,
				completedAt,
				startedAt,
				userAgent,
				answers,
				email,
				name,
				ip,
			});
		}

		const correctQuestionOptions: IResponseCorrection['correctQuestionOptions'] = [];

		questionnaire.questions.forEach((question) => {
			if (!question.showCorrectAnswer) return;
			const optionIds: string[] = [];
			if ('options' in question) {
				question.options.forEach(option => {
					if (option.correct) optionIds.push(option._id.toString());
				});
			}
			correctQuestionOptions.push({ questionId: question._id.toString(), optionIds });
		});

		return {
			respondentToken: respondentToken as string,
			correction: { correctQuestionOptions, correctedAnswers: answers }
		};
	}
}
