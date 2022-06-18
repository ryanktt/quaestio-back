import {
	EQuestionnaireErrorCode,
	IFetchQuestionnaireParams,
	ICreateQuestionnaireQuizParams,
} from './questionnaire.interface';
import { Question, Questionnaire, QuestionnaireQuiz } from './questionnaire.schema';
import { QuestionnaireRepository } from './questionnaire.repository';
import { QuestionnaireHelper } from './questionnaire.helper';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppError, UtilsAuth } from '@utils/*';

@Injectable()
export class QuestionnaireService {
	constructor(
		private readonly questionnaireRepository: QuestionnaireRepository,
		private readonly questionnaireHelper: QuestionnaireHelper,
		@Inject(forwardRef(() => UtilsAuth)) private readonly utilsAuth: UtilsAuth,
	) {}

	async fetchQuestionnaire({
		questionnaireSharedId,
		questionnaireId,
		user,
	}: IFetchQuestionnaireParams): Promise<Questionnaire | undefined> {
		let questionnaire;
		if (questionnaireId) {
			questionnaire = await this.questionnaireRepository.fetchById(questionnaireId);
		} else if (questionnaireSharedId) {
			questionnaire = await this.questionnaireRepository.fetchBySharedId(questionnaireSharedId);
		}

		await this.utilsAuth.validateUserDocAccess(questionnaire, [{ doc: user, refKey: 'user' }]);
		return questionnaire;
	}

	async createQuestionnaireQuiz({
		questions: questionDiscriminatorInputArray,
		title,
		user,
	}: ICreateQuestionnaireQuizParams): Promise<QuestionnaireQuiz> {
		const errCollector = AppError.collectorInstance();

		const questions = questionDiscriminatorInputArray.map((discriminatorInput, index) => {
			const question = this.questionnaireHelper.getQuestionFromQuestionDiscriminatorInput(discriminatorInput);
			const errObj = {
				message: `object of specified type ${discriminatorInput.type} was not provided at index[${index}]`,
				code: EQuestionnaireErrorCode.INVALID_QUESTION,
			};
			if (!question) errCollector.collect(new AppError(errObj));
			return question as Question;
		});

		this.questionnaireHelper.validateTitle(title).catch((err: AppError) => errCollector.collect(err));

		errCollector.run({
			code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_INVALID_PARAMS,
			message: 'invalid params to create questionnaire',
		});

		return this.questionnaireRepository.createQuiz({ questions, title, userId: user.id });
	}
}
