import {
	EAnswerType,
	IValidateAnswer,
	EResponseErrorCode,
	ICreateResponseParams,
} from './response.interface';
import {
	AnswerDiscriminatorInput,
	CreateResponseValidator,
	AnswerInput,
	AnswerTypes,
	Answer,
} from './schema';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppError, UtilsPromise } from '@utils/*';
import { SessionHelper } from 'src/session';
import Joi from 'joi';

@Injectable()
export class ResponseHelper {
	constructor(
		@Inject(forwardRef(() => SessionHelper)) private readonly sessionHelper: SessionHelper,
		private readonly utilsPromise: UtilsPromise,
	) {}

	async validateCreateResponseParams(params: ICreateResponseParams): Promise<void> {
		await this.utilsPromise
			.promisify(() => Joi.assert(params, CreateResponseValidator))
			.catch((originalError: Error) => {
				throw new AppError({
					code: EResponseErrorCode.CREATE_RESPONSE_INVALID_PARAMS,
					message: 'invalid params to create response',
					originalError,
				});
			});
	}

	getAnswerFromAnswerDiscriminatorInput(
		answerDiscriminatorInput: AnswerDiscriminatorInput,
	): Answer | undefined {
		const map: Record<EAnswerType, AnswerInput | undefined> = {
			[EAnswerType.MULTIPLE_CHOICE]: answerDiscriminatorInput.answerMultipleChoice,
			[EAnswerType.SINGLE_CHOICE]: answerDiscriminatorInput.answerSingleChoice,
			[EAnswerType.TRUE_OR_FALSE]: answerDiscriminatorInput.answerTrueOrFalse,
			[EAnswerType.TEXT]: answerDiscriminatorInput.answerText,
		};

		const answerInput = map[answerDiscriminatorInput.type];
		if (!answerInput) return;

		const answer: Partial<Answer> & Partial<AnswerInput> & Partial<Record<string, unknown>> = {
			...answerInput,
		};

		answer.question = answer.questionId;
		delete answer.questionId;
		if ('optionIds' in answer) {
			answer.options = answer.optionIds;
			delete answer.optionIds;
		}
		if ('optionId' in answer) {
			answer.option = answer.optionId;
			delete answer.optionId;
		}

		return answer as Answer;
	}

	validateAnswers({ answers, questionnaire }: IValidateAnswer): void {
		const questionMap: Record<string, { required: boolean; verified: boolean }> = {};
		questionnaire.questions.forEach(
			(question) => (questionMap[question._id.toString()] = { required: question.required, verified: false }),
		);

		answers.forEach((answer: AnswerTypes) => {
			const questionId = answer.question.toString();

			if (!(questionId in questionMap)) {
				throw new AppError({
					message: 'the question does not exist',
					code: EResponseErrorCode.INVALID_ANSWER,
				});
			}

			if (questionMap[questionId].verified) {
				throw new AppError({
					message: 'answer submitted multiple times for the same question',
					code: EResponseErrorCode.INVALID_ANSWER,
				});
			}

			let isAnswered = false;
			if (answer.type === EAnswerType.SINGLE_CHOICE || answer.type === EAnswerType.TRUE_OR_FALSE) {
				if (answer.option) isAnswered = true;
			}
			if (answer.type === EAnswerType.MULTIPLE_CHOICE) {
				if (answer.options && answer.options.length > 0) isAnswered = true;
			}
			if (answer.type === EAnswerType.TEXT) {
				if (answer.text) isAnswered = true;
			}

			if (questionMap[questionId].required && !isAnswered) {
				throw new AppError({
					message: 'question is required but either no option was selected or no text was filled',
					code: EResponseErrorCode.INVALID_ANSWER,
				});
			}
			questionMap[questionId].verified = true;
		});
	}

	async getGuestRespondentJwtPayload(authToken?: string): Promise<{ responseId: string } | undefined> {
		if (!authToken) return;
		const payload = await this.sessionHelper
			.validateAndGetJwtPublicPayload(authToken)
			.catch((err) => console.error(err));
		return typeof payload === 'object' && 'responseId' in payload ? payload : undefined;
	}
}
