import { EQuestionnaireErrorCode, ICreateQuestionnaireQuizParams } from './questionnaire.interface';
import { QuestionnaireRepository } from './questionnaire.repository';
import { Question, QuestionnaireQuiz } from './questionnaire.schema';
import { QuestionnaireHelper } from './questionnaire.helper';

import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class QuestionnaireService {
	constructor(
		private readonly questionnaireRepository: QuestionnaireRepository,
		private readonly questionnaireHelper: QuestionnaireHelper,
	) {}

	async createQuestionnaireQuiz({
		questions: questionDiscriminatorInputArray,
		title,
		user,
	}: ICreateQuestionnaireQuizParams): Promise<QuestionnaireQuiz> {
		const errCollector = AppError.collectorInstance();

		this.questionnaireHelper.validateTitle(title).catch((err: AppError) => errCollector.collect(err));

		const questions = questionDiscriminatorInputArray.map((discriminatorInput, index) => {
			const question = this.questionnaireHelper.getQuestionFromQuestionDiscriminatorInput(discriminatorInput);
			const errObj = {
				message: `type ${discriminatorInput.type} was specified, but object was not provided at index[${index}]`,
				code: EQuestionnaireErrorCode.INVALID_QUESTION,
			};
			if (!question) errCollector.collect(new AppError(errObj));
			return question as Question;
		});

		errCollector.run({
			code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_INVALID_PARAMS,
			message: 'invalid params to create questionnaire',
		});

		return this.questionnaireRepository.createQuiz({ questions, title, userId: user.id });
	}
}
