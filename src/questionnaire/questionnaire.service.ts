import {
	EQuestionnaireType,
	EQuestionnaireErrorCode,
	IFetchQuestionnaireParams,
	ICreateQuestionnaireParams,
} from './questionnaire.interface';
import { QuestionnaireRepository } from './questionnaire.repository';
import { QuestionnaireHelper } from './questionnaire.helper';
import { Question, Questionnaire } from './schema';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppError, UtilsAuth } from '@utils/*';

@Injectable()
export class QuestionnaireService {
	constructor(
		private readonly questionnaireRepository: QuestionnaireRepository,
		private readonly questionnaireHelper: QuestionnaireHelper,
		@Inject(forwardRef(() => UtilsAuth)) private readonly utilsAuth: UtilsAuth,
	) {}

	async fetchQuestionnaire(params: IFetchQuestionnaireParams): Promise<Questionnaire | undefined> {
		const { questionnaireSharedId, questionnaireId, user } = params;
		await this.questionnaireHelper.validateFetchQuestionnaireParams(params).catch((originalError: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_INVALID_PARAMS,
				message: 'invalid params to fetch questionnaire',
				originalError,
			});
		});

		let questionnaire;
		if (questionnaireId) {
			questionnaire = await this.questionnaireRepository.fetchById(questionnaireId);
		} else if (questionnaireSharedId) {
			questionnaire = await this.questionnaireRepository.fetchBySharedId(questionnaireSharedId);
		}

		await this.utilsAuth.validateUserDocAccess(questionnaire, [{ doc: user, refKey: 'user' }]);
		return questionnaire;
	}

	async createQuestionnaire(params: ICreateQuestionnaireParams): Promise<Questionnaire> {
		const { questions: questionDiscriminatorInputArray, title, type, user } = params;
		await this.questionnaireHelper.validateCreateQuestionnaireParams(params).catch((originalError: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_INVALID_PARAMS,
				message: 'invalid params to create questionnaire',
				originalError,
			});
		});

		const questions = questionDiscriminatorInputArray.map((input) => {
			return this.questionnaireHelper.getQuestionFromQuestionDiscriminatorInput(input) as Question;
		});

		if (type === EQuestionnaireType.QuestionnaireQuiz) {
			return this.questionnaireRepository.createQuiz({ questions, title, userId: user.id });
		}
		if (type === EQuestionnaireType.QuestionnaireSurvey) {
			return this.questionnaireRepository.createSurvey({ questions, title, userId: user.id });
		}
		const { passingGradePercent, randomizeQuestions, maxRetryAmount, timeLimit } = params;
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
