import {
	EQuestionType,
	EQuestionnaireErrorCode,
	IFetchQuestionnaireParams,
	ICreateQuestionnaireParams,
} from './questionnaire.interface';
import {
	CreateQuestionnaireValidator,
	FetchQuestionnaireValidator,
	QuestionDiscriminatorInput,
	QuestionInput,
	Question,
} from './schema';

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

	async validateTitle(title: string): Promise<void> {
		return this.utilsPromise.promisify(() => {
			const code = EQuestionnaireErrorCode.INVALID_TITLE;
			if (title.length < 3) throw new AppError({ message: 'invalid title, min character length: 3', code });
			if (title.length > 350) {
				throw new AppError({ message: 'invalid title, max character length: 350', code });
			}
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
