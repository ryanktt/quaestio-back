import {
	EAnswerType,
	ICorrectAnswers,
	IValidateAnswers,
	EResponseErrorCode,
	IPublicUpsertQuestResponseParams,
	IFetchResponsesParams,
} from './response.interface';
import {
	PublicUpsertQuestResponseValidator,
	AnswerDiscriminatorInput,
	FetchResponsesValidator,
	AnswerInput,
	AnswerTypes,
	Answer,
} from './schema';

import {
	IInvokeUpsertQuestionnaireResponseLambda,
	ISendQuestionnaireResponseToKinesis,
	ISendQuestionnaireResponseToSQS,
} from '@modules/session/session.interface';
import { QuestionTypes } from '@modules/questionnaire/schema/questionnaire.schema';
import { EQuestionType } from '@modules/questionnaire/questionnaire.interface';
import { IEnvirolmentVariables } from 'src/app.module';
import { UtilsPromise } from '@utils/utils.promise';
import { ConfigService } from '@nestjs/config';
import { AppError } from '@utils/utils.error';
import { UtilsAWS } from '@utils/utils.aws';
import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import Joi from 'joi';

@Injectable()
export class ResponseHelper {
	constructor(
		private readonly configService: ConfigService<IEnvirolmentVariables>,
		private readonly utilsPromise: UtilsPromise,
		private readonly utilsAWS: UtilsAWS,
	) { }

	async validateFetchResponsesParams(params: IFetchResponsesParams): Promise<void> {
		await this.utilsPromise
			.promisify(() => Joi.assert(params, FetchResponsesValidator))
			.catch((originalError: Error) => {
				throw new AppError({
					code: EResponseErrorCode.FETCH_RESPONSES_INVALID_PARAMS,
					message: 'invalid params to fetch responses',
					originalError,
				});
			});
	}

	async validatePublicUpsertResponseParams(params: IPublicUpsertQuestResponseParams): Promise<void> {
		await this.utilsPromise
			.promisify(() => Joi.assert(params, PublicUpsertQuestResponseValidator))
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
			[EAnswerType.RATING]: answerDiscriminatorInput.answerRating,
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

	validateAnswers(params: IValidateAnswers): void {
		const { answers, questionnaire } = params;
		const questionMap: Record<string, { required: boolean; verified: boolean; type: EQuestionType }> = {};
		questionnaire.questions.forEach(
			(question) =>
			(questionMap[question._id.toString()] = {
				required: question.required,
				verified: false,
				type: question.type,
			}),
		);

		answers.forEach((answer: AnswerTypes) => {
			const questionId = answer.question.toString();
			if (!(questionId in questionMap)) {
				throw new Error('the question does not exist');
			}

			const question = questionMap[questionId];

			if ((question.type as string) !== (answer.type as string)) {
				throw new Error('the question type is different than the answer type');
			}

			if (question.verified) {
				throw new Error('answer submitted multiple times for the same question');
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
			if (answer.type === EAnswerType.RATING) {
				if (typeof answer.rating === 'number') isAnswered = true;
			}

			if (questionMap[questionId].required && !isAnswered) {
				throw new Error('question is required but either no option was selected or no text was filled');
			}
			questionMap[questionId].verified = true;
		});
	}

	correctAnswers({ answers, questionnaire }: ICorrectAnswers): void {
		const isOptionCorrect = (optionId: string, correctOpIds: string[]): boolean =>
			correctOpIds.includes(optionId);

		const isOptionsCorrect = (optionIds: string[], correctOpIds: string[]): boolean =>
			correctOpIds.every((correctOptionId) => optionIds.includes(correctOptionId));

		const questionMap: Record<string, { correctOptionIds: string[] }> = {};
		const { questions } = questionnaire;

		questions.forEach((question: QuestionTypes) => {
			const questionId = question._id.toString();
			questionMap[questionId] = { correctOptionIds: [] };
			if ('options' in question) {
				questionMap[questionId].correctOptionIds = question.options.reduce((accumulator, option) => {
					return option.correct ? [...accumulator, option._id.toString()] : accumulator;
				}, []);
			}
		});

		answers.forEach((answer: AnswerTypes) => {
			const questionId = answer.question;
			const correctOptionIds = questionMap[questionId].correctOptionIds;

			if ('option' in answer && answer.option) {
				answer.correct = isOptionCorrect(answer.option, correctOptionIds);
			} else if ('options' in answer && answer.options && answer.options.length > 0) {
				answer.correct = isOptionsCorrect(answer.options, correctOptionIds);
			} else if ('text' in answer || 'rating' in answer) {
				answer.correct = true;
			}

			if (answer.correct === undefined) answer.answeredAt = undefined;
		});
	}

	async sendQuestionnaireResponseToKinesis(payload: ISendQuestionnaireResponseToKinesis): Promise<void> {
		const streamName = this.configService.get<string>(
			'AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_KINESIS_STREAM_NAME',
			'',
		);
		const region = this.configService.get<string>('AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION', '');

		await this.utilsAWS.sendToKineses({
			key: nanoid(10),
			streamName,
			payload,
			region,
		});
	}

	async sendQuestionnaireResponseToSQS(payload: ISendQuestionnaireResponseToSQS): Promise<void> {
		const queueUrl = this.configService.get<string>('AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_QUEUE_URL', '');
		const region = this.configService.get<string>('AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION', '');

		await this.utilsAWS.sendToSQS({ queueUrl, payload, region });
	}

	async invokeUpsertQuestionnaireResponseLambda(
		payload: IInvokeUpsertQuestionnaireResponseLambda,
	): Promise<void> {
		const funcName = this.configService.get<string>('AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_FUNCTION_NAME', '');
		const endpoint = this.configService.get<string>('AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_ENDPOINT', '');
		const region = this.configService.get<string>('AWS_UPSERT_RESPONSE_LAMBDA_CONSUMER_REGION', '');

		await this.utilsAWS.invokeLambda({
			payload: { Records: [{ body: payload }] },
			functionName: funcName,
			endpoint,
			region,
		});
	}
}
