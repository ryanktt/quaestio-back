import {
	EQuestionType,
	EQuestionMethodType,
	EQuestionnaireErrorCode,
	IFetchQuestionnaireParams,
	ICreateQuestionnaireParams,
	IFetchQuestionnairesParams,
	IUpdateQuestionnaireParams,
	IDeleteQuestionnaireParams,
	QuestionInputTypes,
} from './questionnaire.interface';
import {
	CreateQuestionnaireValidator,
	UpdateQuestionnaireValidator,
	DeleteQuestionnaireValidator,
	FetchQuestionnairesValidator,
	FetchQuestionnaireValidator,
	QuestionDiscriminatorInput,
	QuestionnaireDocument,
	QuestionMethodInput,
	QuestionTypes,
	Option,
} from './schema';
import {
	QuestionMetricsTypes,
	QuestionnaireMetrics,
	QuestionMetricsWithOptionsTypes,
} from './schema/questionnaire-metrics';

import { UtilsPromise } from '@utils/utils.promise';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import Joi from 'joi';
import {
	QuestionnaireDocTypes,
	QuestionnaireTypes,
} from 'src/bootstrap/consumers/upsert-questionnaire-response/types/types';
import { ObjectId } from 'mongodb';

@Injectable()
export class QuestionnaireHelper {
	constructor(private readonly utilsPromise: UtilsPromise) { }

	async validateCreateQuestionnaireParams(params: ICreateQuestionnaireParams): Promise<void> {
		await this.utilsPromise
			.promisify(() => Joi.assert(params, CreateQuestionnaireValidator))
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_INVALID_PARAMS,
					message: 'invalid params to create questionnaire',
					originalError,
				});
			});
	}

	async validateUpdateQuestionnaireParams(params: IUpdateQuestionnaireParams): Promise<void> {
		await this.utilsPromise
			.promisify(() => Joi.assert(params, UpdateQuestionnaireValidator))
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.UPDATE_QUESTIONNAIRE_INVALID_PARAMS,
					message: 'invalid params to update questionnaire',
					originalError,
				});
			});
	}

	async validateFetchQuestionnaireParams(params: IFetchQuestionnaireParams): Promise<void> {
		await this.utilsPromise
			.promisify(() => Joi.assert(params, FetchQuestionnaireValidator))
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_INVALID_PARAMS,
					message: 'invalid params to fetch questionnaire',
					originalError,
				});
			});
	}

	async validateFetchQuestionnairesParams(params: IFetchQuestionnairesParams): Promise<void> {
		await this.utilsPromise
			.promisify(() => Joi.assert(params, FetchQuestionnairesValidator))
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_INVALID_PARAMS,
					message: 'invalid params to fetch questionnaires',
					originalError,
				});
			});
	}

	async validateDeleteQuestionnaireParams(params: IDeleteQuestionnaireParams): Promise<void> {
		await this.utilsPromise
			.promisify(() => Joi.assert(params, DeleteQuestionnaireValidator))
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.DELETE_QUESTIONNAIRE_INVALID_PARAMS,
					message: 'invalid params to delete questionnaire',
					originalError,
				});
			});
	}

	getQuestionFromQuestionDiscriminatorInput(
		questionDiscriminatorInput?: QuestionDiscriminatorInput,
	): QuestionTypes | undefined {
		if (!questionDiscriminatorInput) return undefined;
		const map: Record<EQuestionType, QuestionInputTypes | undefined> = {
			[EQuestionType.MULTIPLE_CHOICE]: questionDiscriminatorInput.questionMultipleChoice,
			[EQuestionType.SINGLE_CHOICE]: questionDiscriminatorInput.questionSingleChoice,
			[EQuestionType.TRUE_OR_FALSE]: questionDiscriminatorInput.questionTrueOrFalse,
			[EQuestionType.TEXT]: questionDiscriminatorInput.questionText,
		};

		const questionInput = map[questionDiscriminatorInput.type];

		const options: Option[] = [];
		if (questionInput && 'options' in questionInput) {
			questionInput.options.forEach((optInput) => {
				const option = { _id: new ObjectId(optInput.id), ...optInput };
				delete option.id;
				options.push(option as Option);
			});
		}

		return { ...questionInput, options } as QuestionTypes;
	}




	getQuestionsFromQuestionMethodsInput(
		questionnaire: QuestionnaireDocument,
		questionMethods?: QuestionMethodInput[],
	): QuestionTypes[] | undefined {
		if (!questionMethods) return undefined;
		const questions = [...questionnaire.toObject().questions as QuestionTypes[]];
		questionMethods.forEach(({ questionDiscriminator, questionId, type }) => {
			const question = this.getQuestionFromQuestionDiscriminatorInput(questionDiscriminator);
			const questionIndex = questions.findIndex((q) => q._id.toString() === questionId);

			if ((type === EQuestionMethodType.CREATE || type === EQuestionMethodType.UPDATE) && question) {
				questions.push(question);
			}
			if ((type === EQuestionMethodType.UPDATE || type === EQuestionMethodType.DELETE)) {
				questions.splice(questionIndex, 1);
			}
		});
		return questions;
	}

	getQuestionnaireQuestionMetrics(
		questionnaire: QuestionnaireTypes | QuestionnaireDocTypes,
		metrics?: QuestionnaireMetrics,
	): QuestionMetricsTypes[] {
		const metricsMap = new Map<string, QuestionMetricsTypes>();
		metrics?.questionMetrics.forEach((metrics) => metricsMap.set(metrics._id.toString(), metrics));

		return questionnaire.questions.map((question) => {
			let metrics = metricsMap.get(question._id.toString());
			if (!metrics) {
				metrics = { _id: question._id, type: question.type } as QuestionMetricsTypes;
				if ('options' in question) {
					metrics = {
						...metrics,
						options: question.options.map((option) => ({ _id: option._id })),
					} as QuestionMetricsWithOptionsTypes;
				}
			}
			return metrics;
		});
	}
}
