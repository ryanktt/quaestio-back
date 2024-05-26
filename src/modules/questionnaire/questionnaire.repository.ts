import {
	QuestionnaireModel,
	QuestionnaireDocument,
	QuestionnaireQuizModel,
	QuestionnaireExamModel,
	QuestionnaireSurveyModel,
	QuestionnaireExamDocument,
	QuestionnaireQuizDocument,
	QuestionnaireSurveyDocument,
	Questionnaire,
} from './schema';
import {
	IRepositoryUpdateQuestionnareSurveyParams,
	IRepositoryCreateQuestionnaireExamParams,
	IRepositoryUpdateQuestionnareQuizParams,
	IRepositoryUpdateQuestionnareExamParams,
	IRepositoryFetchQuestionnairesParams,
	IRepositoryFetchQuestionnaireParams,
	IRepositoryCreateQuestionnareParams,
	EQuestionnaireErrorCode,
} from './questionnaire.interface';

import {
	QuestionnaireMetrics,
	QuestionnaireMetricsModel,
	QuestionnaireMetricsDocument,
} from './schema/questionnaire-metrics';
import { QuestionnaireHelper } from './questionnaire.helper';
import { FilterType } from '@utils/utils.schema';
import { UtilsArray } from '@utils/utils.array';
import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { UtilsDoc } from '@utils/utils.doc';
import { Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import DataLoader from 'dataloader';
import {
	QuestionnaireDocTypes,
	QuestionnaireTypes,
} from 'src/bootstrap/consumers/upsert-questionnaire-response/types/types';
import { ObjectId } from 'mongodb';

@Injectable()
export class QuestionnaireRepository {
	constructor(
		@InjectModel('QuestionnaireMetrics')
		private readonly questionnaireMetricsSchema: QuestionnaireMetricsModel,
		@InjectModel('QuestionnaireSurvey') private readonly questionnaireSurveySchema: QuestionnaireSurveyModel,
		@InjectModel('QuestionnaireExam') private readonly questionnaireExamSchema: QuestionnaireExamModel,
		@InjectModel('QuestionnaireQuiz') private readonly questionnaireQuizSchema: QuestionnaireQuizModel,
		@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel,
		private readonly questionnaireHelper: QuestionnaireHelper,
		private readonly utilsArray: UtilsArray,
		private readonly utilsDoc: UtilsDoc,
	) {}

	async fetchQuestionnaires({
		questionnaireSharedIds,
		questionnaireIds,
		userIds,
		latest,
	}: IRepositoryFetchQuestionnairesParams): Promise<Questionnaire[]> {
		const query: FilterType<QuestionnaireDocument> = {};
		if (typeof latest === 'boolean') query.latest = latest;
		if (questionnaireSharedIds) query.sharedId = { $in: questionnaireSharedIds };
		if (questionnaireIds) query._id = { $in: questionnaireIds };
		if (userIds) query.user = { $in: userIds };

		return this.questionnaireSchema
			.find(query)
			.lean()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_ERROR,
					message: 'fail to fetch questionnaires',
					originalError,
				});
			}) as Promise<Questionnaire[]>;
	}

	async fetchQuestionnaire({
		questionnaireSharedId,
		questionnaireId,
		latest,
		userId,
	}: IRepositoryFetchQuestionnaireParams): Promise<QuestionnaireDocument | undefined> {
		const query: FilterType<QuestionnaireDocument> = {};
		if (typeof latest === 'boolean') query.latest = latest;
		if (questionnaireSharedId) query.sharedId = questionnaireSharedId;
		if (questionnaireId) query._id = new ObjectId(questionnaireId);
		if (userId) query.user = new ObjectId(userId);

		const questionnaire = (await this.questionnaireSchema
			.findOne(query)
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_ERROR,
					message: 'fail to fetch questionnaire',
					originalError,
				});
			})) as QuestionnaireDocument | null;
		return questionnaire || undefined;
	}

	async fetchQuestionnaireMetricsById(id: string): Promise<QuestionnaireMetricsDocument | undefined> {
		const metrics = (await this.questionnaireMetricsSchema
			.findById(new ObjectId(id))
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_METRICS_ERROR,
					message: 'fail to fetch questionnaire metrics by id',
					originalError,
				});
			})) as QuestionnaireMetricsDocument | null;
		return metrics || undefined;
	}

	async fetchQuestionnaireMetricsByIds(questionnaireIds: string[]): Promise<QuestionnaireMetrics[]> {
		return this.questionnaireMetricsSchema
			.find({ _id: { $in: questionnaireIds } })
			.lean()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRE_METRICS_ERROR,
					message: 'fail to fetch questionnaires metric by ids',
					originalError,
				});
			}) as Promise<QuestionnaireMetrics[]>;
	}

	async fetchById(questionnaireId: string): Promise<QuestionnaireDocument | undefined> {
		const questionnaire = (await this.questionnaireSchema
			.findById(new ObjectId(questionnaireId))
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

	questionnaireMetricsLoader(): DataLoader<string, QuestionnaireMetrics> {
		return new DataLoader<string, QuestionnaireMetrics>(async (ids: string[]) => {
			const metrics = await this.fetchQuestionnaireMetricsByIds(ids);
			return this.utilsArray.getObjectsSortedByIds(metrics, '_id', ids);
		});
	}

	async createQuestionnaireMetrics(
		questionnaire: QuestionnaireDocTypes | QuestionnaireTypes,
		session?: ClientSession,
	): Promise<QuestionnaireMetricsDocument> {
		const questionMetrics = this.questionnaireHelper.getQuestionnaireQuestionMetrics(questionnaire);
		const metrics = new this.questionnaireMetricsSchema({
			_id: questionnaire._id,
			questionMetrics,
		});
		return metrics.save({ session }).catch((originalError: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_METRICS_ERROR,
				message: 'fail to create questionnaire metrics',
				originalError,
			});
		}) as Promise<QuestionnaireMetricsDocument>;
	}

	async updateQuestionnaireMetrics(
		params: {
			updatedQuestionnaire: QuestionnaireDocTypes | QuestionnaireTypes;
			metrics: QuestionnaireMetrics;
		},
		session?: ClientSession,
	): Promise<QuestionnaireMetricsDocument> {
		const questionMetrics = this.questionnaireHelper.getQuestionnaireQuestionMetrics(
			params.updatedQuestionnaire,
			params.metrics,
		);
		const updatedMetrics = new this.questionnaireMetricsSchema({
			_id: params.updatedQuestionnaire._id,
			questionMetrics,
		});
		return updatedMetrics.save({ session }).catch((originalError: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_METRICS_ERROR,
				message: 'fail to create questionnaire metrics',
				originalError,
			});
		}) as Promise<QuestionnaireMetricsDocument>;
	}

	async createQuiz(
		{ requireEmail, requireName, questions, userId, title }: IRepositoryCreateQuestionnareParams,
		session?: ClientSession,
	): Promise<QuestionnaireQuizDocument> {
		const quiz = new this.questionnaireQuizSchema({
			user: userId,
			requireEmail,
			requireName,
			questions,
			title,
		}) as QuestionnaireQuizDocument;

		await quiz.save({ session }).catch((originalError: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_QUIZ_ERROR,
				message: 'fail to create questionnaire quiz',
				originalError,
			});
		});
		await this.createQuestionnaireMetrics(quiz, session);
		return quiz;
	}

	async createSurvey(
		{ requireEmail, requireName, questions, userId, title }: IRepositoryCreateQuestionnareParams,
		session?: ClientSession,
	): Promise<QuestionnaireSurveyDocument> {
		const survey = new this.questionnaireSurveySchema({
			user: userId,
			requireEmail,
			requireName,
			questions,
			title,
		}) as QuestionnaireSurveyDocument;

		await survey.save({ session }).catch((originalError: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_SURVEY_ERROR,
				message: 'fail to create questionnaire survey',
				originalError,
			});
		});
		await this.createQuestionnaireMetrics(survey, session);
		return survey;
	}

	async createExam(
		{
			passingGradePercent,
			randomizeQuestions,
			maxRetryAmount,
			requireEmail,
			requireName,
			questions,
			timeLimit,
			userId,
			title,
		}: IRepositoryCreateQuestionnaireExamParams,
		session?: ClientSession,
	): Promise<QuestionnaireExamDocument> {
		const exam = new this.questionnaireExamSchema({
			passingGradePercent,
			randomizeQuestions,
			maxRetryAmount,
			user: userId,
			requireEmail,
			requireName,
			timeLimit,
			questions,
			title,
		}) as QuestionnaireExamDocument;

		exam.save({ session }).catch((originalError: Error) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.CREATE_QUESTIONNAIRE_EXAM_ERROR,
				message: 'fail to create questionnaire exam',
				originalError,
			});
		});
		await this.createQuestionnaireMetrics(exam, session);
		return exam;
	}

	async updateQuiz(
		{ requireEmail, requireName, metrics, questions, title, quiz }: IRepositoryUpdateQuestionnareQuizParams,
		session?: ClientSession,
	): Promise<QuestionnaireQuizDocument> {
		const updatedQuiz = new this.questionnaireQuizSchema({
			requireEmail: quiz.requireEmail,
			requireName: quiz.requireName,
			createdAt: quiz.createdAt,
			questions: quiz.questions,
			sharedId: quiz.sharedId,
			title: quiz.title,
			user: quiz.user,
			updatedAt: new Date(),
		}) as QuestionnaireQuizDocument;

		this.utilsDoc.handleFieldUpdate({
			doc: updatedQuiz,
			field: 'requireEmail',
			value: requireEmail,
			defaultValue: true,
		});
		this.utilsDoc.handleFieldUpdate({
			doc: updatedQuiz,
			field: 'requireName',
			value: requireName,
			defaultValue: false,
		});
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'questions', value: questions });
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'title', value: title });
		this.utilsDoc.handleFieldUpdate({ doc: quiz, field: 'latest', value: false });

		return this.utilsDoc.startMongodbSession(async (session) => {
			try {
				await quiz.save({ session });
				await this.updateQuestionnaireMetrics({ updatedQuestionnaire: updatedQuiz, metrics }, session);
				return updatedQuiz.save({ session }) as Promise<QuestionnaireQuizDocument>;
			} catch (err) {
				throw new AppError({
					code: EQuestionnaireErrorCode.UPDATE_QUESTIONNAIRE_QUIZ_ERROR,
					originalError: err instanceof Error ? err : undefined,
					message: 'fail to update questionnaire quiz',
				});
			}
		}, session);
	}

	async updateSurvey(
		{
			requireEmail,
			requireName,
			questions,
			metrics,
			survey,
			title,
		}: IRepositoryUpdateQuestionnareSurveyParams,
		session?: ClientSession,
	): Promise<QuestionnaireSurveyDocument> {
		const updatedSurvey = new this.questionnaireSurveySchema({
			requireEmail: survey.requireEmail,
			requireName: survey.requireName,
			createdAt: survey.createdAt,
			questions: survey.questions,
			sharedId: survey.sharedId,
			title: survey.title,
			user: survey.user,
			updatedAt: new Date(),
		}) as QuestionnaireSurveyDocument;

		this.utilsDoc.handleFieldUpdate({
			doc: updatedSurvey,
			field: 'requireEmail',
			value: requireEmail,
			defaultValue: true,
		});
		this.utilsDoc.handleFieldUpdate({
			doc: updatedSurvey,
			field: 'requireName',
			value: requireName,
			defaultValue: false,
		});
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'questions', value: questions });
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'title', value: title });
		this.utilsDoc.handleFieldUpdate({ doc: survey, field: 'latest', value: false });

		return this.utilsDoc.startMongodbSession(async (session): Promise<QuestionnaireSurveyDocument> => {
			try {
				await survey.save({ session });
				await this.updateQuestionnaireMetrics({ updatedQuestionnaire: updatedSurvey, metrics }, session);
				return updatedSurvey.save({ session }) as Promise<QuestionnaireSurveyDocument>;
			} catch (err) {
				throw new AppError({
					code: EQuestionnaireErrorCode.UPDATE_QUESTIONNAIRE_SURVEY_ERROR,
					originalError: err instanceof Error ? err : undefined,
					message: 'fail to update questionnaire survey',
				});
			}
		}, session);
	}

	async updateExam(
		{
			passingGradePercent,
			randomizeQuestions,
			maxRetryAmount,
			requireEmail,
			requireName,
			questions,
			timeLimit,
			metrics,
			title,
			exam,
		}: IRepositoryUpdateQuestionnareExamParams,
		session?: ClientSession,
	): Promise<QuestionnaireExamDocument> {
		const updatedExam = new this.questionnaireExamSchema({
			maxRetryAmount: exam.maxRetryAmount,
			passingGradePercent: exam.passingGradePercent,
			randomizeQuestions: exam.randomizeQuestions,
			requireEmail: exam.requireEmail,
			requireName: exam.requireName,
			timeLimit: exam.timeLimit,
			createdAt: exam.createdAt,
			questions: exam.questions,
			sharedId: exam.sharedId,
			title: exam.title,
			user: exam.user,
			updatedAt: new Date(),
		}) as QuestionnaireExamDocument;

		this.utilsDoc.handleFieldUpdate({
			doc: updatedExam,
			field: 'passingGradePercent',
			value: passingGradePercent,
		});
		this.utilsDoc.handleFieldUpdate({
			doc: updatedExam,
			field: 'randomizeQuestions',
			value: randomizeQuestions,
		});
		this.utilsDoc.handleFieldUpdate({
			doc: updatedExam,
			field: 'requireEmail',
			value: requireEmail,
			defaultValue: true,
		});
		this.utilsDoc.handleFieldUpdate({
			doc: updatedExam,
			field: 'requireName',
			value: requireName,
			defaultValue: false,
		});
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'maxRetryAmount', value: maxRetryAmount });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'timeLimit', value: timeLimit });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'questions', value: questions });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'title', value: title });
		this.utilsDoc.handleFieldUpdate({ doc: exam, field: 'latest', value: false });

		return this.utilsDoc.startMongodbSession(async (session): Promise<QuestionnaireExamDocument> => {
			try {
				await exam.save({ session });
				await this.updateQuestionnaireMetrics({ updatedQuestionnaire: updatedExam, metrics }, session);
				return updatedExam.save({ session }) as Promise<QuestionnaireExamDocument>;
			} catch (err) {
				throw new AppError({
					code: EQuestionnaireErrorCode.UPDATE_QUESTIONNAIRE_EXAM_ERROR,
					originalError: err instanceof Error ? err : undefined,
					message: 'fail to update questionnaire exam',
				});
			}
		}, session);
	}
}
