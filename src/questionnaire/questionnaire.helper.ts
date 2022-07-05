import {
	EQuestionType,
	EQuestionnaireErrorCode,
	IFetchQuestionnaireParams,
	ICreateQuestionnaireParams,
	IFetchQuestionnairesParams,
	IUpdateQuestionnaireParams,
	IgetQuestionsMetricsParams,
} from './questionnaire.interface';
import {
	CreateQuestionnaireValidator,
	UpdateQuestionnaireValidator,
	FetchQuestionnairesValidator,
	FetchQuestionnaireValidator,
	QuestionDiscriminatorInput,
	QuestionMetrics,
	QuestionInput,
	QuestionTypes,
	Question,
} from './schema';

import { AnswerTypes, MetricsMapRecord } from 'src/response';
import { AppError, UtilsPromise } from '@utils/*';
import { Injectable } from '@nestjs/common';
import Joi from 'joi';

@Injectable()
export class QuestionnaireHelper {
	constructor(private readonly utilsPromise: UtilsPromise) {}

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

	getQuestionFromQuestionDiscriminatorInput(
		questionDiscriminatorInput: QuestionDiscriminatorInput,
	): Question | undefined {
		const map: Record<EQuestionType, QuestionInput | undefined> = {
			[EQuestionType.MULTIPLE_CHOICE]: questionDiscriminatorInput.questionMultipleChoice,
			[EQuestionType.SINGLE_CHOICE]: questionDiscriminatorInput.questionSingleChoice,
			[EQuestionType.TRUE_OR_FALSE]: questionDiscriminatorInput.questionTrueOrFalse,
			[EQuestionType.TEXT]: questionDiscriminatorInput.questionText,
		};

		return map[questionDiscriminatorInput.type] as Question | undefined;
	}

	getQuestionsMetrics(params: IgetQuestionsMetricsParams): QuestionMetrics[] {
		const sumRightAnswerCount = (rightAnswerCount?: number, isCorrect?: boolean): number =>
			isCorrect ? (rightAnswerCount || 0) + 1 : 0;

		const sumWrongAnswerCount = (wrongAnswerCount?: number, isCorrect?: boolean): number =>
			isCorrect ? 0 : (wrongAnswerCount || 0) + 1;

		const sumSelectedCount = (selectedCount?: number): number => (selectedCount || 0) + 1;

		const sumAnswerCount = (answerCount?: number): number => (answerCount || 0) + 1;

		const { responses, questionnaire } = params;
		const questionsMetricsMap: MetricsMapRecord = {};

		responses.forEach(({ answers }) =>
			answers.forEach((answer: AnswerTypes) => {
				questionsMetricsMap[answer.question] = { optionsMetrics: {} };
				const metrics = questionsMetricsMap[answer.question];
				metrics.rightAnswerCount = sumRightAnswerCount(metrics?.rightAnswerCount, answer?.correct);
				metrics.wrongAnswerCount = sumWrongAnswerCount(metrics?.wrongAnswerCount, answer?.correct);
				metrics.answerCount = sumAnswerCount(metrics?.answerCount);

				if ('option' in answer && answer.option) {
					metrics.optionsMetrics[answer.option] = {
						selectedCount: sumSelectedCount(metrics.optionsMetrics?.[answer.option]?.selectedCount),
					};
				}
				if ('options' in answer && answer.options) {
					answer.options.forEach((option) => {
						metrics.optionsMetrics[option] = {
							selectedCount: sumSelectedCount(metrics.optionsMetrics?.[option]?.selectedCount),
						};
					});
				}
			}),
		);

		return questionnaire.questions.map((question: QuestionTypes) => {
			const questionId = question._id.toString();
			const metrics = questionsMetricsMap[questionId];
			return {
				questionId: questionId,
				unansweredCount: responses.length - (metrics?.answerCount || 0),
				rightAnswerCount: metrics?.rightAnswerCount || 0,
				wrongAnswerCount: metrics?.wrongAnswerCount || 0,
				answerCount: metrics?.answerCount || 0,
				optionsMetrics:
					'options' in question
						? question.options.map((option) => {
								const optionId = option._id.toString();
								return {
									selectedCount: metrics?.optionsMetrics?.[optionId]?.selectedCount || 0,
									optionId,
								};
						  })
						: undefined,
			};
		});
	}
}
