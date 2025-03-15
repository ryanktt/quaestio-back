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
	IRepositoryUpdateQuestionnareSurveyParams,
	IRepositoryCreateQuestionnaireExamParams,
	IRepositoryUpdateQuestionnareQuizParams,
	IRepositoryUpdateQuestionnareExamParams,
	IRepositoryDeleteQuestionnaireParams,
	IRepositoryFetchQuestionnaireParams,
	IRepositoryCreateQuestionnareParams,
	EQuestionnaireErrorCode,
	IRepositoryToggleActive,
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
import { ResponseQuestionnaireRepository } from '@modules/shared/response-questionnaire/response-questionnaire.repository';

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
		private readonly responseQuestionnaireRepo: ResponseQuestionnaireRepository,
		private readonly utilsArray: UtilsArray,
		private readonly utilsDoc: UtilsDoc,
	) { }

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
			.exec()
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
			.findOne({ sharedId: questionnaireSharedId, latest: true })
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

	async deleteQuestionnaire({ questionnaireSharedId }: IRepositoryDeleteQuestionnaireParams): Promise<void> {
		await this.utilsDoc.startMongodbSession(async (session) => {
			try {
				await this.questionnaireSchema.deleteMany({ sharedId: questionnaireSharedId }).session(session).exec();
				await this.questionnaireMetricsSchema.deleteMany({ sharedId: questionnaireSharedId }).session(session).exec();
				await this.responseQuestionnaireRepo.deleteResponses({ questionnaireSharedId }, session);
			} catch (originalError) {
				throw new AppError({
					code: EQuestionnaireErrorCode.DELETE_QUESTIONNAIRE_ERROR,
					message: 'fail to delete questionnaire',
					originalError: originalError as Error,
				});
			}
		});
	}

	async createQuestionnaireMetrics(
		questionnaire: QuestionnaireDocTypes | QuestionnaireTypes,
		session?: ClientSession,
	): Promise<QuestionnaireMetricsDocument> {
		const questionMetrics = this.questionnaireHelper.getQuestionnaireQuestionMetrics(questionnaire);
		const metrics = new this.questionnaireMetricsSchema({
			sharedId: questionnaire.sharedId,
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
		},
		session?: ClientSession,
	): Promise<QuestionnaireMetricsDocument> {
		const questionMetrics = this.questionnaireHelper.getQuestionnaireQuestionMetrics(
			params.updatedQuestionnaire,
		);
		const updatedMetrics = new this.questionnaireMetricsSchema({
			_id: params.updatedQuestionnaire._id,
			sharedId: params.updatedQuestionnaire.sharedId,
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
		{
			requireEmail,
			requireName,
			questions,
			userId,
			title,
			description,
			color,
			bgColor,
		}: IRepositoryCreateQuestionnareParams,
		session?: ClientSession,
	): Promise<QuestionnaireQuizDocument> {
		const quiz = new this.questionnaireQuizSchema({
			user: userId,
			requireEmail,
			description,
			requireName,
			questions,
			bgColor,
			color,
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
		{
			requireEmail,
			requireName,
			questions,
			userId,
			title,
			description,
			bgColor,
			color,
		}: IRepositoryCreateQuestionnareParams,
		session?: ClientSession,
	): Promise<QuestionnaireSurveyDocument> {
		const survey = new this.questionnaireSurveySchema({
			user: userId,
			requireEmail,
			description,
			requireName,
			questions,
			bgColor,
			color,
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
			description,
			questions,
			bgColor,
			color,
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
			description,
			timeLimit,
			questions,
			bgColor,
			color,
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
		{
			requireEmail,
			active,
			requireName,
			questions,
			title,
			description,
			quiz,
			bgColor,
			color,
		}: IRepositoryUpdateQuestionnareQuizParams,
		session?: ClientSession,
	): Promise<QuestionnaireQuizDocument> {
		const updatedQuiz = new this.questionnaireQuizSchema({
			sharedCreatedAt: quiz.sharedCreatedAt,
			requireEmail: quiz.requireEmail,
			requireName: quiz.requireName,
			description: quiz.description,
			questions: quiz.questions,
			sharedId: quiz.sharedId,
			bgColor: quiz.bgColor,
			active: quiz.active,
			title: quiz.title,
			color: quiz.color,
			user: quiz.user,
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
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'description', value: description });
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'questions', value: questions });
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'bgColor', value: bgColor });
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'active', value: active });
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'title', value: title });
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'color', value: color });
		this.utilsDoc.handleFieldUpdate({ doc: quiz, field: 'latest', value: false });

		return this.utilsDoc.startMongodbSession(async (session) => {
			try {
				await quiz.save({ session });
				await this.updateQuestionnaireMetrics({ updatedQuestionnaire: updatedQuiz }, session);
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
			description,
			requireEmail,
			requireName,
			questions,
			bgColor,
			color,
			active,
			survey,
			title,
		}: IRepositoryUpdateQuestionnareSurveyParams,
		session?: ClientSession,
	): Promise<QuestionnaireSurveyDocument> {
		const updatedSurvey = new this.questionnaireSurveySchema({
			sharedCreatedAt: survey.sharedCreatedAt,
			requireEmail: survey.requireEmail,
			requireName: survey.requireName,
			description: survey.description,
			questions: survey.questions,
			sharedId: survey.sharedId,
			bgColor: survey.bgColor,
			active: survey.active,
			title: survey.title,
			color: survey.color,
			user: survey.user,
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
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'description', value: description });
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'questions', value: questions });
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'title', value: title });
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'active', value: active });
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'bgColor', value: bgColor });
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'color', value: color });
		this.utilsDoc.handleFieldUpdate({ doc: survey, field: 'latest', value: false });

		return this.utilsDoc.startMongodbSession(async (session): Promise<QuestionnaireSurveyDocument> => {
			try {
				await survey.save({ session });
				await this.updateQuestionnaireMetrics({ updatedQuestionnaire: updatedSurvey }, session);
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
			description,
			requireName,
			questions,
			timeLimit,
			bgColor,
			color,
			active,
			title,
			exam,
		}: IRepositoryUpdateQuestionnareExamParams,
		session?: ClientSession,
	): Promise<QuestionnaireExamDocument> {
		const updatedExam = new this.questionnaireExamSchema({
			maxRetryAmount: exam.maxRetryAmount,
			passingGradePercent: exam.passingGradePercent,
			randomizeQuestions: exam.randomizeQuestions,
			sharedCreatedAt: exam.sharedCreatedAt,
			requireEmail: exam.requireEmail,
			requireName: exam.requireName,
			description: exam.description,
			timeLimit: exam.timeLimit,
			questions: exam.questions,
			sharedId: exam.sharedId,
			active: exam.active,
			title: exam.title,
			user: exam.user,
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
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'description', value: description });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'active', value: active });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'title', value: title });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'bgColor', value: bgColor });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'color', value: color });
		this.utilsDoc.handleFieldUpdate({ doc: exam, field: 'latest', value: false });

		return this.utilsDoc.startMongodbSession(async (session): Promise<QuestionnaireExamDocument> => {
			try {
				await exam.save({ session });
				await this.updateQuestionnaireMetrics({ updatedQuestionnaire: updatedExam }, session);
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

	async toggleQuestionnaireActive({
		questionnaire,
		active,
	}: IRepositoryToggleActive): Promise<QuestionnaireDocTypes> {
		questionnaire.active = typeof active === 'boolean' ? active : !questionnaire.active;
		return questionnaire.save().catch((err) => {
			throw new AppError({
				code: EQuestionnaireErrorCode.UPDATE_QUESTIONNAIRE_ERROR,
				originalError: err instanceof Error ? err : undefined,
				message: 'fail to toggle questionnaire active',
			});
		}) as Promise<QuestionnaireDocTypes>;
	}
}
