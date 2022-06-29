import { ICreateResponseParams } from './response.interface';
import { ResponseRepository } from './response.repository';
import { ResponseHelper } from './response.helper';
import { Answer, Response } from './schema';

import { EQuestionnaireErrorCode, QuestionnaireRepository } from 'src/questionnaire';
import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class ResponseService {
	constructor(
		private readonly questionnaireRepository: QuestionnaireRepository,
		private readonly responseRepository: ResponseRepository,
		private readonly responseHelper: ResponseHelper,
	) {}

	async createResponse(params: ICreateResponseParams): Promise<Response> {
		const { answers: answerDiscriminatorInputArray, questionnaireId, user } = params;
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

		return this.responseRepository.create({ answers, userId: user.id, questionnaireId, attemptCount: 0 });
	}
}
