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
	QuestionTypes,
} from './schema';
import { QuestionnaireHelper } from './questionnaire.helper';
import { QuestionnaireRepository } from './questionnaire.repository';

import { AppError } from '@utils/utils.error';
import { UtilsDoc } from '@utils/utils.doc';
import { Injectable } from '@nestjs/common';
import { QuestionnaireDocTypes } from 'src/bootstrap/consumers/upsert-questionnaire-response/types/types';

@Injectable()
export class QuestionnaireService {
	constructor(
		private readonly questionnaireRepository: QuestionnaireRepository,
		private readonly questionnaireHelper: QuestionnaireHelper,
		private readonly utilsDoc: UtilsDoc,
	) { }

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

	async createQuestionnaire(params: ICreateQuestionnaireParams): Promise<QuestionnaireDocTypes> {
		const {
			questions: questionDiscriminatorInputArray,
			requireEmail,
			description,
			requireName,
			title,
			type,
			user,
		} = params;
		await this.questionnaireHelper.validateCreateQuestionnaireParams(params);

		const questions = questionDiscriminatorInputArray.map((input) => {
			return this.questionnaireHelper.getQuestionFromQuestionDiscriminatorInput(input) as QuestionTypes;
		});

		return this.utilsDoc.startMongodbSession(async (session) => {
			if (type === EQuestionnaireType.Quiz) {
				return this.questionnaireRepository.createQuiz(
					{ questions, description, requireEmail, requireName, title, userId: user._id },
					session,
				);
			}
			if (type === EQuestionnaireType.Survey) {
				return this.questionnaireRepository.createSurvey(
					{ questions, description, requireEmail, requireName, title, userId: user._id },
					session,
				);
			}

			const { passingGradePercent, randomizeQuestions, maxRetryAmount, timeLimit } = params;
			return this.questionnaireRepository.createExam(
				{
					passingGradePercent,
					randomizeQuestions,
					userId: user._id,
					maxRetryAmount,
					requireEmail,
					description,
					requireName,
					timeLimit,
					questions,
					title,
				},
				session,
			);
		});
	}

	async updateQuestionnaire(params: IUpdateQuestionnaireParams): Promise<QuestionnaireDocTypes> {
		const { questionMethods, questionnaireId, title, description, type, user } = params;
		await this.questionnaireHelper.validateUpdateQuestionnaireParams(params);

		const [questionnaire, metrics] = await Promise.all([
			this.questionnaireRepository.fetchQuestionnaire({
				userId: user.id,
				questionnaireId,
				latest: true,
			}),
			this.questionnaireRepository.fetchQuestionnaireMetricsById(questionnaireId),
		]);
		if (!questionnaire || questionnaire.type !== type) {
			throw new AppError({
				code: EQuestionnaireErrorCode.QUESTIONNAIRE_NOT_FOUND,
				message: 'questionnaire was not found',
			});
		}
		if (!metrics) {
			throw new AppError({
				code: EQuestionnaireErrorCode.QUESTIONNAIRE_METRICS_NOT_FOUND,
				message: 'questionnaire metrics was not found',
			});
		}

		const questions = this.questionnaireHelper.getQuestionsFromQuestionMethodsInput(
			questionnaire,
			questionMethods,
		);

		return this.utilsDoc.startMongodbSession(async (session) => {
			if (type === EQuestionnaireType.Quiz) {
				return this.questionnaireRepository.updateQuiz(
					{
						quiz: questionnaire as QuestionnaireQuizDocument,
						description,
						questions,
						metrics,
						title,
					},
					session,
				);
			}

			if (type === EQuestionnaireType.Survey) {
				return this.questionnaireRepository.updateSurvey(
					{
						survey: questionnaire as QuestionnaireSurveyDocument,
						description,
						questions,
						metrics,
						title,
					},
					session,
				);
			}

			const { passingGradePercent, randomizeQuestions, maxRetryAmount, timeLimit } = params;
			return this.questionnaireRepository.updateExam(
				{
					exam: questionnaire as QuestionnaireExamDocument,
					passingGradePercent,
					randomizeQuestions,
					maxRetryAmount,
					description,
					timeLimit,
					questions,
					metrics,
					title,
				},
				session,
			);
		});
	}
}
