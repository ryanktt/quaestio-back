import {
	EQuestionnaireType,
	EQuestionnaireErrorCode,
	IFetchQuestionnaireParams,
	ICreateQuestionnaireParams,
	IFetchQuestionnairesParams,
	IUpdateQuestionnaireParams,
} from './questionnaire.interface';
import {
	QuestionnaireSurveyDocument,
	QuestionnaireExamDocument,
	QuestionnaireQuizDocument,
	Questionnaire,
	Question,
} from './schema';
import { QuestionnaireHelper } from './questionnaire.helper';
import { QuestionnaireRepository } from './questionnaire.repository';

import { Injectable } from '@nestjs/common';
import { AppError } from '@utils/*';

@Injectable()
export class QuestionnaireService {
	constructor(
		private readonly questionnaireRepository: QuestionnaireRepository,
		private readonly questionnaireHelper: QuestionnaireHelper,
	) {}

	async fetchQuestionnaire(params: IFetchQuestionnaireParams): Promise<Questionnaire | undefined> {
		const { questionnaireSharedId, questionnaireId, latest, user } = params;
		await this.questionnaireHelper.validateFetchQuestionnaireParams(params);

		return this.questionnaireRepository.fetchQuestionnaire({
			...(questionnaireId ? { questionnaireId } : { questionnaireSharedId }),
			userId: user.id,
			latest,
		});
	}

	async fetchQuestionnaires(params: IFetchQuestionnairesParams): Promise<Questionnaire[]> {
		const { questionnaireSharedIds, questionnaireIds, latest, user } = params;
		await this.questionnaireHelper.validateFetchQuestionnairesParams(params);

		return this.questionnaireRepository.fetchQuestionnaires({
			questionnaireSharedIds,
			userIds: [user.id],
			questionnaireIds,
			latest,
		});
	}

	async createQuestionnaire(params: ICreateQuestionnaireParams): Promise<Questionnaire> {
		const { questions: questionDiscriminatorInputArray, title, type, user } = params;
		await this.questionnaireHelper.validateCreateQuestionnaireParams(params);

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

	async updateQuestionnaire(params: IUpdateQuestionnaireParams): Promise<Questionnaire> {
		const { questions: questionDiscriminatorInputArray, questionnaireId, title, type, user } = params;
		await this.questionnaireHelper.validateUpdateQuestionnaireParams(params);

		const questionnaire = await this.questionnaireRepository.fetchQuestionnaire({
			questionnaireId,
			userId: user.id,
			latest: true,
		});

		if (!questionnaire || questionnaire.type !== type) {
			throw new AppError({
				code: EQuestionnaireErrorCode.QUESTIONNAIRE_NOT_FOUND,
				message: 'questionnaire was not found',
			});
		}

		const questions = questionDiscriminatorInputArray?.map((input) => {
			return this.questionnaireHelper.getQuestionFromQuestionDiscriminatorInput(input) as Question;
		});

		if (type === EQuestionnaireType.QuestionnaireQuiz) {
			return this.questionnaireRepository.updateQuiz({
				quiz: questionnaire as QuestionnaireQuizDocument,
				questions,
				title,
			});
		}

		if (type === EQuestionnaireType.QuestionnaireSurvey) {
			return this.questionnaireRepository.updateSurvey({
				survey: questionnaire as QuestionnaireSurveyDocument,
				questions,
				title,
			});
		}

		const { passingGradePercent, randomizeQuestions, maxRetryAmount, timeLimit } = params;
		return this.questionnaireRepository.updateExam({
			exam: questionnaire as QuestionnaireExamDocument,
			passingGradePercent,
			randomizeQuestions,
			maxRetryAmount,
			timeLimit,
			questions,
			title,
		});
	}
}
