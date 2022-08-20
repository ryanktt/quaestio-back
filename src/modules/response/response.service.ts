import { IUpsertResponseParams, IPublicUpsertResponseParams } from './response.interface';
import { ResponseRepository } from './response.repository';
import { AnswerTypes, ResponseDocument } from './schema';
import { ResponseHelper } from './response.helper';

import { ResponseQuestionnaireRepository } from '@modules/shared/response-questionnaire/response-questionnaire.repository';
import { ResponseQuestionnaireHelper } from '@modules/shared/response-questionnaire/response-questionnaire.helper';
import { EQuestionnaireErrorCode, EQuestionnaireType } from '@modules/questionnaire/questionnaire.interface';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import { isLocal } from 'src/app.module';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResponseService {
	constructor(
		private readonly responseQuestionnaireRepository: ResponseQuestionnaireRepository,
		private readonly responseQuestionnaireHelper: ResponseQuestionnaireHelper,
		private readonly responseRepository: ResponseRepository,
		private readonly responseHelper: ResponseHelper,
	) {}

	async upsertQuestionnaireExamResponse(params: IUpsertResponseParams): Promise<ResponseDocument> {
		const { answers: answerDiscriminatorInputArray, questionnaireId, responseId } = params;
		await this.responseHelper.validateUpsertResponseParams(params);

		const answers = answerDiscriminatorInputArray.map((input) => {
			return this.responseHelper.getAnswerFromAnswerDiscriminatorInput(input) as AnswerTypes;
		});

		const questionnaire = await this.responseQuestionnaireRepository.fetchById(questionnaireId);
		if (!questionnaire || questionnaire.type !== EQuestionnaireType.QuestionnaireExam) {
			throw new AppError({
				code: EQuestionnaireErrorCode.QUESTIONNAIRE_NOT_FOUND,
				message: 'questionnaire not found',
			});
		}

		this.responseHelper.validateAnswers({ answers, questionnaire });
		this.responseHelper.correctAnswers({ answers, questionnaire });

		// update questionnaireMetrics

		const response = await this.responseRepository.fetchById(responseId);
		if (!response) {
			return this.responseRepository.create({ answers, questionnaireId });
		} else {
			response.answers = answers;
			return this.responseRepository.save(response);
		}
	}

	async publicUpsertSurveyResponse({
		answers: answerDiscriminatorInputArray,
		questionnaireId,
		authToken,
	}: IPublicUpsertResponseParams): Promise<{ authToken: string }> {
		const answers = answerDiscriminatorInputArray.map((input) => {
			return this.responseHelper.getAnswerFromAnswerDiscriminatorInput(input) as AnswerTypes;
		});

		const jwtPayload = await this.responseHelper.getGuestRespondentJwtPayload(authToken);
		let guestRespondentId = jwtPayload?.guestRespondentId;

		if (!guestRespondentId) {
			guestRespondentId = uuidv4();
			authToken = this.responseQuestionnaireHelper.signPublicUpsertResponseToken({ guestRespondentId });
		}
		if (isLocal()) {
			await this.responseHelper.invokeUpsertQuestionnaireResponseLambda({
				guestRespondentId,
				questionnaireId,
				answers,
			});
		} else {
			await this.responseHelper.sendQuestionnaireResponseToKinesis({
				guestRespondentId,
				questionnaireId,
				answers,
			});
		}

		return { authToken: authToken || '' };
	}
}
