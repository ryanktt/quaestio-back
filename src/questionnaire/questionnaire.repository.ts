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
	IRepositoryFetchQuestionnairesParams,
	IRepositoryFetchQuestionnaireParams,
	IRepositoryCreateQuestionnareParams,
	EQuestionnaireErrorCode,
} from './questionnaire.interface';

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppError, FilterType, UtilsDoc } from '@utils/*';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class QuestionnaireRepository {
	constructor(
		@InjectModel('QuestionnaireSurvey') private readonly questionnaireSurveySchema: QuestionnaireSurveyModel,
		@InjectModel('QuestionnaireExam') private readonly questionnaireExamSchema: QuestionnaireExamModel,
		@InjectModel('QuestionnaireQuiz') private readonly questionnaireQuizSchema: QuestionnaireQuizModel,
		@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel,
		@Inject(forwardRef(() => UtilsDoc)) private readonly utilsDoc: UtilsDoc,
	) {}

	async fetchQuestionnaires({
		questionnaireSharedIds,
		questionnaireIds,
		userIds,
	}: IRepositoryFetchQuestionnairesParams): Promise<QuestionnaireDocument[]> {
		const query: FilterType<QuestionnaireDocument> = {};
		if (questionnaireSharedIds) query.sharedId = { $in: questionnaireSharedIds };
		if (questionnaireIds) query._id = { $in: questionnaireIds };
		if (userIds) query.user = { $in: userIds };

		return this.questionnaireSchema
			.find(query)
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_ERROR,
					message: 'fail to fetch questionnaires',
					originalError,
				});
			}) as Promise<QuestionnaireDocument[]>;
	}

	async fetchQuestionnaire({
		questionnaireSharedId,
		questionnaireId,
		userId,
	}: IRepositoryFetchQuestionnaireParams): Promise<QuestionnaireDocument | undefined> {
		const query: FilterType<QuestionnaireDocument> = {};
		if (questionnaireSharedId) query.sharedId = questionnaireSharedId;
		if (questionnaireId) query._id = questionnaireId;
		if (userId) query.user = userId;

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
		return questionnaire ? questionnaire : undefined;
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

	async updateQuiz({
		questions,
		title,
		quiz,
	}: IRepositoryUpdateQuestionnareQuizParams): Promise<QuestionnaireQuizDocument> {
		const updatedQuiz = new this.questionnaireQuizSchema({
			createdAt: quiz.createdAt,
			questions: quiz.questions,
			sharedId: quiz.sharedId,
			title: quiz.title,
			user: quiz.user,
			updatedAt: new Date(),
		}) as QuestionnaireQuizDocument;

		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'questions', value: questions });
		this.utilsDoc.handleFieldUpdate({ doc: updatedQuiz, field: 'title', value: title });

		return this.utilsDoc.startMongodbSession(async (session): Promise<QuestionnaireQuizDocument> => {
			this.utilsDoc.handleFieldUpdate({ doc: quiz, field: 'latest', value: false });
			try {
				await quiz.save({ session });
				return updatedQuiz.save({ session }) as Promise<QuestionnaireQuizDocument>;
			} catch (err) {
				throw new AppError({
					code: EQuestionnaireErrorCode.UPDATE_QUESTIONNAIRE_QUIZ_ERROR,
					originalError: err instanceof Error ? err : undefined,
					message: 'fail to update questionnaire quiz',
				});
			}
		});
	}

	async updateSurvey({
		questions,
		survey,
		title,
	}: IRepositoryUpdateQuestionnareSurveyParams): Promise<QuestionnaireSurveyDocument> {
		const updatedSurvey = new this.questionnaireSurveySchema({
			createdAt: survey.createdAt,
			questions: survey.questions,
			sharedId: survey.sharedId,
			title: survey.title,
			user: survey.user,
			updatedAt: new Date(),
		}) as QuestionnaireSurveyDocument;

		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'questions', value: questions });
		this.utilsDoc.handleFieldUpdate({ doc: updatedSurvey, field: 'title', value: title });

		return this.utilsDoc.startMongodbSession(async (session): Promise<QuestionnaireSurveyDocument> => {
			this.utilsDoc.handleFieldUpdate({ doc: survey, field: 'latest', value: false });
			try {
				await survey.save({ session });
				return updatedSurvey.save({ session }) as Promise<QuestionnaireSurveyDocument>;
			} catch (err) {
				throw new AppError({
					code: EQuestionnaireErrorCode.UPDATE_QUESTIONNAIRE_SURVEY_ERROR,
					originalError: err instanceof Error ? err : undefined,
					message: 'fail to update questionnaire survey',
				});
			}
		});
	}

	async updateExam({
		passingGradePercent,
		randomizeQuestions,
		maxRetryAmount,
		questions,
		timeLimit,
		title,
		exam,
	}: IRepositoryUpdateQuestionnareExamParams): Promise<QuestionnaireExamDocument> {
		const updatedExam = new this.questionnaireExamSchema({
			maxRetryAmount: exam.maxRetryAmount,
			passingGradePercent: exam.passingGradePercent,
			randomizeQuestions: exam.randomizeQuestions,
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
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'maxRetryAmount', value: maxRetryAmount });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'timeLimit', value: timeLimit });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'questions', value: questions });
		this.utilsDoc.handleFieldUpdate({ doc: updatedExam, field: 'title', value: title });

		return this.utilsDoc.startMongodbSession(async (session): Promise<QuestionnaireExamDocument> => {
			this.utilsDoc.handleFieldUpdate({ doc: exam, field: 'latest', value: false });
			try {
				await exam.save({ session });
				return updatedExam.save({ session }) as Promise<QuestionnaireExamDocument>;
			} catch (err) {
				throw new AppError({
					code: EQuestionnaireErrorCode.UPDATE_QUESTIONNAIRE_EXAM_ERROR,
					originalError: err instanceof Error ? err : undefined,
					message: 'fail to update questionnaire exam',
				});
			}
		});
	}
}
