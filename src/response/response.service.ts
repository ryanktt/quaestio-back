import { ICreateResponseParams, IPublicCreateResponseParams } from './response.interface';
import { ResponseRepository } from './response.repository';
import { Answer, ResponseDocument } from './schema';
import { ResponseHelper } from './response.helper';

import { EQuestionnaireErrorCode, QuestionnaireRepository } from 'src/questionnaire';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SessionHelper } from 'src/session';
import { AppError } from '@utils/*';

@Injectable()
export class ResponseService {
	constructor(
		@Inject(forwardRef(() => SessionHelper)) private readonly sessionHelper: SessionHelper,
		private readonly questionnaireRepository: QuestionnaireRepository,
		private readonly responseRepository: ResponseRepository,
		private readonly responseHelper: ResponseHelper,
	) {}

	async createResponse(params: ICreateResponseParams): Promise<ResponseDocument> {
		const { answers: answerDiscriminatorInputArray, questionnaireId, responseId } = params;
		await this.responseHelper.validateCreateResponseParams(params);

		const answers = answerDiscriminatorInputArray.map((input) => {
			return this.responseHelper.getAnswerFromAnswerDiscriminatorInput(input) as Answer;
		});

		// fetch questionnaire
		const questionnaire = await this.questionnaireRepository.fetchById(questionnaireId);
		if (!questionnaire) {
			throw new AppError({
				code: EQuestionnaireErrorCode.QUESTIONNAIRE_NOT_FOUND,
				message: 'questionnaire not found',
			});
		}

		// get answers from answerDiscInputArr
		// validate answers
		// 	assert all questions have an answer answers.lenght === questions.length
		// 	assert required questions are answered (answeredAt)
		// correct answers
		// 	multiple choice: verify if all options are correct to define the answer as correct
		// 	singl choice: find the question option and see if its corrext

		return this.responseRepository.create({ answers, questionnaireId, attemptCount: 0 });
	}

	async publicCreateResponse({
		questionnaireId,
		authToken,
		answers,
	}: IPublicCreateResponseParams): Promise<{ response: ResponseDocument; authToken: string }> {
		let responseId;
		if (authToken) {
			const payload = await this.sessionHelper
				.validateAndGetJwtPublicPayload(authToken)
				.catch((err) => console.error(err));
			responseId = typeof payload === 'object' && 'responseId' in payload ? payload.responseId : undefined;
		}

		const response = await this.createResponse({ answers, questionnaireId, responseId });

		if (!responseId) {
			const tokenExpDate = this.sessionHelper.getExpirationDate();
			authToken = this.sessionHelper.signJwtToken({ responseId: response.id }, tokenExpDate);
		}

		return { response, authToken: authToken as string };
	}
}
