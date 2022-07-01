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

		const questionnaire = await this.questionnaireRepository.fetchById(questionnaireId);
		if (!questionnaire) {
			throw new AppError({
				code: EQuestionnaireErrorCode.QUESTIONNAIRE_NOT_FOUND,
				message: 'questionnaire not found',
			});
		}

		this.responseHelper.validateAnswers({ answers, questionnaire });
		this.responseHelper.correctAnswers({ answers, questionnaire });

		const response = await this.responseRepository.fetchById(responseId);
		if (!response) {
			return this.responseRepository.create({ answers, questionnaireId });
		} else {
			response.answers = answers;
			return this.responseRepository.save(response);
		}
	}

	async publicCreateResponse({
		questionnaireId,
		authToken,
		answers,
	}: IPublicCreateResponseParams): Promise<{ response: ResponseDocument; authToken: string }> {
		const payload = await this.responseHelper.getGuestRespondentJwtPayload(authToken);

		const responseId = typeof payload === 'object' ? payload.responseId : undefined;
		const response = await this.createResponse({ answers, questionnaireId, responseId });

		if (!payload) {
			const tokenExpDate = this.sessionHelper.getExpirationDate();
			authToken = this.sessionHelper.signJwtToken({ responseId: response.id }, tokenExpDate);
		}

		return { response, authToken: authToken || '' };
	}
}
