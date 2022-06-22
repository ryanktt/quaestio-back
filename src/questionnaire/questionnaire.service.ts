import {
	EQuestionnaireErrorCode,
	IFetchQuestionnaireParams,
	ICreateQuestionnaireParams,
	EQuestionnaireType,
} from './questionnaire.interface';
import { QuestionnaireRepository } from './questionnaire.repository';
import { Question, Questionnaire } from './questionnaire.schema';
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

	async createQuestionnaire({
		questions: questionDiscriminatorInputArray,
		passingGradePercent,
		randomizeQuestions,
		maxRetryAmount,
		timeLimit,
		type,
		title,
		user,
	}: ICreateQuestionnaireParams): Promise<Questionnaire> {
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

		if (type === EQuestionnaireType.QuestionnaireQuiz) {
			return this.questionnaireRepository.createQuiz({ questions, title, userId: user.id });
		}
		if (type === EQuestionnaireType.QuestionnaireSurvey) {
			return this.questionnaireRepository.createSurvey({ questions, title, userId: user.id });
		}
		return this.questionnaireRepository.createExam({
			passingGradePercent,
			randomizeQuestions,
			userId: user.id,
			maxRetryAmount,
			timeLimit,
			questions,
			title,
		});
	}
}
