import {
	IFetchResponseParams,
	IFetchResponsesParams,
	IPublicUpsertQuestResponseParams,
} from './response.interface';
import { AnswerTypes, Response } from './schema';
import { ResponseHelper } from './response.helper';

import { ResponseQuestionnaireHelper } from '@modules/shared/response-questionnaire/response-questionnaire.helper';
import { ResponseRepository } from './response.repository';
import { Injectable } from '@nestjs/common';
import { isLocal } from 'src/app.module';
import { ObjectId } from 'mongodb';

@Injectable()
export class ResponseService {
	constructor(
		private readonly responseQuestionnaireHelper: ResponseQuestionnaireHelper,
		private readonly responseRepository: ResponseRepository,
		private readonly responseHelper: ResponseHelper,
	) { }

	async adminFetchResponse(params: IFetchResponseParams): Promise<Response | undefined> {
		return this.responseRepository.fetchResponse(params).then((res) => {
			console.log(res);
			return res?.user.toString() === params.user._id.toString() ? res : undefined;
		});
	}

	async adminFetchResponses(params: IFetchResponsesParams): Promise<Response[]> {
		await this.responseHelper.validateFetchResponsesParams(params);
		return this.responseRepository.fetchResponses(params);
	}

	async publicUpsertQuestionnaireResponse(
		params: IPublicUpsertQuestResponseParams,
	): Promise<{ respondentToken: string }> {
		await this.responseHelper.validatePublicUpsertResponseParams(params);
		const {
			answers: answerDiscriminatorInputArray,
			questionnaireId,
			completedAt,
			startedAt,
			userAgent,
			email,
			name,
			ip,
		} = params;
		const answers = answerDiscriminatorInputArray.map((input) => {
			return this.responseHelper.getAnswerFromAnswerDiscriminatorInput(input) as AnswerTypes;
		});

		let respondentToken = params.respondentToken;
		if (!params.respondentToken) {
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

		return { respondentToken: respondentToken as string };
	}
}
