import { IPublicUpsertQuestResponseParams } from './response.interface';
import { AnswerTypes } from './schema';
import { ResponseHelper } from './response.helper';

import { ResponseQuestionnaireHelper } from '@modules/shared/response-questionnaire/response-questionnaire.helper';
import { Injectable } from '@nestjs/common';
import { isLocal } from 'src/app.module';
import { ObjectId } from 'mongodb';

@Injectable()
export class ResponseService {
	constructor(
		private readonly responseQuestionnaireHelper: ResponseQuestionnaireHelper,
		private readonly responseHelper: ResponseHelper,
	) {}

	async publicUpsertQuestionnaireResponse(
		params: IPublicUpsertQuestResponseParams,
	): Promise<{ authToken: string }> {
		await this.responseHelper.validatePublicUpsertResponseParams(params);
		const {
			answers: answerDiscriminatorInputArray,
			questionnaireId,
			completedAt,
			authToken,
			startedAt,
			userAgent,
			email,
			name,
			ip,
		} = params;
		const answers = answerDiscriminatorInputArray.map((input) => {
			return this.responseHelper.getAnswerFromAnswerDiscriminatorInput(input) as AnswerTypes;
		});

		let respondentToken = authToken;
		if (!authToken) {
			const respondentId = new ObjectId().toString();
			respondentToken = this.responseQuestionnaireHelper.signPublicUpsertResponseToken({ respondentId });
		}

		if (isLocal()) {
			await this.responseHelper.invokeUpsertQuestionnaireResponseLambda({
				respondentToken,
				questionnaireId,
				completedAt,
				startedAt,
				userAgent,
				answers,
				email,
				name,
				ip,
			});
		} else {
			await this.responseHelper.sendQuestionnaireResponseToSQS({
				respondentToken,
				questionnaireId,
				completedAt,
				startedAt,
				userAgent,
				answers,
				email,
				name,
				ip,
			});
		}

		return { authToken: respondentToken as string };
	}
}
