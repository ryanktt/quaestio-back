import {
	EQuestionType,
	EQuestionnaireErrorCode,
	IFetchQuestionnaireParams,
	ICreateQuestionnaireParams,
	IFetchQuestionnairesParams,
	IUpdateQuestionnaireParams,
} from './questionnaire.interface';
import {
	CreateQuestionnaireValidator,
	UpdateQuestionnaireValidator,
	FetchQuestionnairesValidator,
	FetchQuestionnaireValidator,
	QuestionDiscriminatorInput,
	QuestionInput,
	Question,
} from './schema';

import { UtilsPromise } from '@utils/utils.promise';
import { AppError } from '@utils/utils.error';
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
}
