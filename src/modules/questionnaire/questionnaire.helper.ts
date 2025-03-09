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
	QuestionOrderInput,
	QuestionTypes,
	Option,
} from './schema';
import {
	QuestionMetricsTypes,
	OptionMetrics,
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

	getQuestionFromQuestionDiscriminatorInput({ questionId, questionDiscriminator }:
		{ questionDiscriminator?: QuestionDiscriminatorInput; questionId?: string }
	): QuestionTypes | undefined {
		if (!questionDiscriminator) return undefined;
		const map: Record<EQuestionType, QuestionInputTypes | undefined> = {
			[EQuestionType.MULTIPLE_CHOICE]: questionDiscriminator.questionMultipleChoice,
			[EQuestionType.SINGLE_CHOICE]: questionDiscriminator.questionSingleChoice,
			[EQuestionType.TRUE_OR_FALSE]: questionDiscriminator.questionTrueOrFalse,
			[EQuestionType.TEXT]: questionDiscriminator.questionText,
		};

		const questionInput = map[questionDiscriminator.type];

		const options: Option[] = [];
		if (questionInput && 'options' in questionInput) {
			questionInput.options.forEach((optInput) => {
				const option = { _id: new ObjectId(optInput.id), ...optInput };
				delete option.id;
				options.push(option as Option);
			});
		}

		return { ...questionInput, _id: new ObjectId(questionId), options } as QuestionTypes;
	}

	getQuestionsFromQuestionMethodsInput(
		questionnaire: QuestionnaireDocument,
		questionMethods?: QuestionMethodInput[],
		questionOrder?: QuestionOrderInput[],
	): QuestionTypes[] | undefined {
		if (!questionMethods) return undefined;
		const questions = [...questionnaire.toObject().questions as QuestionTypes[]];
		const updatedQuestions: QuestionTypes[] = [];

		questionOrder?.forEach(({ index, questionId }) => {
			const question = questions.find(({ _id }) => _id.toString() === questionId);
			if (question) updatedQuestions[index] = question;
		});

		questionMethods.forEach(({ questionDiscriminator, questionId, index, type }) => {
			const question = this.getQuestionFromQuestionDiscriminatorInput({ questionDiscriminator, questionId });

			if ((type === EQuestionMethodType.CREATE || type === EQuestionMethodType.UPDATE) && question && typeof index === 'number') {
				updatedQuestions[index] = question;
			}
		});

		return updatedQuestions;
	}

	getQuestionOptionMetrics(question: QuestionTypes): OptionMetrics[] {
		if (!('options' in question && question.options)) return [];
		return question.options.map((option) => ({ _id: option._id, selectedCount: 0 })) as OptionMetrics[];
	}

	getQuestionnaireQuestionMetrics(
		questionnaire: QuestionnaireTypes | QuestionnaireDocTypes,
	): QuestionMetricsTypes[] {

		return questionnaire.questions.map((question: QuestionTypes) => {
			return {
				_id: question._id, type: question.type,
				options: this.getQuestionOptionMetrics(question),
			} as QuestionMetricsTypes;
		});
	}
}
