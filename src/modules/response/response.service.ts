import { IPublicUpsertResponseParams } from './response.interface';
import { AnswerTypes } from './schema';
import { ResponseHelper } from './response.helper';

import { ResponseQuestionnaireHelper } from '@modules/shared/response-questionnaire/response-questionnaire.helper';
import { Injectable } from '@nestjs/common';
import { isLocal } from 'src/app.module';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResponseService {
	constructor(
		private readonly responseQuestionnaireHelper: ResponseQuestionnaireHelper,
		private readonly responseHelper: ResponseHelper,
	) { }

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
			await this.responseHelper.sendQuestionnaireResponseToSQS({
				guestRespondentId,
				questionnaireId,
				answers,
			});
		}

		return { authToken: authToken || '' };
	}
}
