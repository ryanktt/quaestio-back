import {
	QuestionnaireModel,
	QuestionnaireDocument,
	QuestionnaireQuizModel,
	QuestionnaireExamModel,
	QuestionnaireSurveyModel,
	QuestionnaireExamDocument,
	QuestionnaireQuizDocument,
	QuestionnaireSurveyDocument,
} from './schema';
import {
	EQuestionnaireErrorCode,
	IRepositoryCreateQuestionnareParams,
	IRepositoryFetchQuestionnairesParams,
	IRepositoryCreateQuestionnaireExamParams,
} from './questionnaire.interface';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { AppError } from '@utils/*';

@Injectable()
export class QuestionnaireRepository {
	constructor(
		@InjectModel('QuestionnaireSurvey') private readonly questionnaireSurveySchema: QuestionnaireSurveyModel,
		@InjectModel('QuestionnaireExam') private readonly questionnaireExamSchema: QuestionnaireExamModel,
		@InjectModel('QuestionnaireQuiz') private readonly questionnaireQuizSchema: QuestionnaireQuizModel,
		@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel,
	) {}

	async fetchQuestionnaires({
		questionnaireSharedIds,
		questionnaireIds,
		userIds,
	}: IRepositoryFetchQuestionnairesParams): Promise<QuestionnaireDocument[]> {
		const query: FilterQuery<QuestionnaireDocument> = {};
		if (questionnaireSharedIds) query.sharedId = { $in: questionnaireSharedIds };
		if (questionnaireIds) query._id = { $in: questionnaireIds };
		if (userIds) query.user = { $in: userIds };

		return this.questionnaireSchema
			.find(query)
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_ERROR,
					message: 'fail to fetch questionnaires by ids',
					originalError,
				});
			}) as Promise<QuestionnaireDocument[]>;
	}

	async fetchByIds(questionnaireIds: string[]): Promise<QuestionnaireDocument[]> {
		return this.questionnaireSchema
			.find({ _id: { $in: questionnaireIds } })
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_ERROR,
					message: 'fail to fetch questionnaires by ids',
					originalError,
				});
			}) as Promise<QuestionnaireDocument[]>;
	}

	async fetchById(questionnaireId: string): Promise<QuestionnaireDocument | undefined> {
		const questionnaire = (await this.questionnaireSchema
			.findById(questionnaireId)
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_ERROR,
					message: 'fail to fetch questionnaire by id',
					originalError,
				});
			})) as QuestionnaireDocument | null;
		return questionnaire ? questionnaire : undefined;
	}

	async fetchBySharedId(questionnaireSharedId: string): Promise<QuestionnaireDocument | undefined> {
		const questionnaire = (await this.questionnaireSchema
			.findOne({ sharedId: questionnaireSharedId })
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_ERROR,
					message: 'fail to fetch questionnaire by shared id',
					originalError,
				});
			})) as QuestionnaireDocument | null;

		return questionnaire ? questionnaire : undefined;
	}

	async createQuiz({
		questions,
		userId,
		title,
	}: IRepositoryCreateQuestionnareParams): Promise<QuestionnaireQuizDocument> {
		return this.questionnaireQuizSchema
			.create({ title, questions, user: userId })
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_QUIZ_ERROR,
					message: 'fail to create questionnaire quiz',
					originalError,
				});
			}) as Promise<QuestionnaireQuizDocument>;
	}

	async createSurvey({
		questions,
		userId,
		title,
	}: IRepositoryCreateQuestionnareParams): Promise<QuestionnaireSurveyDocument> {
		return this.questionnaireSurveySchema
			.create({ title, questions, user: userId })
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_SURVEY_ERROR,
					message: 'fail to create questionnaire survey',
					originalError,
				});
			}) as Promise<QuestionnaireSurveyDocument>;
	}

	async createExam({
		passingGradePercent,
		randomizeQuestions,
		maxRetryAmount,
		questions,
		timeLimit,
		userId,
		title,
	}: IRepositoryCreateQuestionnaireExamParams): Promise<QuestionnaireExamDocument> {
		return this.questionnaireExamSchema
			.create({
				passingGradePercent,
				randomizeQuestions,
				maxRetryAmount,
				user: userId,
				timeLimit,
				questions,
				title,
			})
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_EXAM_ERROR,
					message: 'fail to create questionnaire exam',
					originalError,
				});
			}) as Promise<QuestionnaireExamDocument>;
	}
}
