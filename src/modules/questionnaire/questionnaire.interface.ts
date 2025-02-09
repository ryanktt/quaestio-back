import {
	QuestionTypes,
	QuestionMethodInput,
	QuestionnaireQuizDocument,
	QuestionnaireExamDocument,
	QuestionDiscriminatorInput,
	QuestionnaireSurveyDocument,
	QuestionSingleChoiceInput,
	QuestionMultipleChoiceInput,
	QuestionTrueOrFalseInput,
	QuestionTextInput,
} from './schema';

import { AdminDocument } from '@modules/user/admin/admin.schema';
import { registerEnumType } from '@nestjs/graphql';
import { QuestionnaireMetricsDocument } from './schema/questionnaire-metrics';
import { ObjectId } from 'mongodb';

export enum EQuestionnaireErrorCode {
	CREATE_QUESTIONNAIRE_INVALID_PARAMS = 'CREATE_QUESTIONNAIRE_INVALID_PARAMS',
	UPDATE_QUESTIONNAIRE_INVALID_PARAMS = 'UPDATE_QUESTIONNAIRE_INVALID_PARAMS',
	FETCH_QUESTIONNAIRE_INVALID_PARAMS = 'FETCH_QUESTIONNAIRE_INVALID_PARAMS',
	FETCH_QUESTIONNAIRES_INVALID_PARAMS = 'FETCH_QUESTIONNAIRES_INVALID_PARAMS',
	CREATE_QUESTIONNAIRE_METRICS_ERROR = 'CREATE_QUESTIONNAIRE_METRICS_ERROR',
	CREATE_QUESTIONNAIRE_SURVEY_ERROR = 'CREATE_QUESTIONNAIRE_SURVEY_ERROR',
	CREATE_QUESTIONNAIRE_QUIZ_ERROR = 'CREATE_QUESTIONNAIRE_QUIZ_ERROR',
	CREATE_QUESTIONNAIRE_EXAM_ERROR = 'CREATE_QUESTIONNAIRE_EXAM_ERROR',
	UPDATE_QUESTIONNAIRE_SURVEY_ERROR = 'UPDATE_QUESTIONNAIRE_SURVEY_ERROR',
	UPDATE_QUESTIONNAIRE_QUIZ_ERROR = 'UPDATE_QUESTIONNAIRE_QUIZ_ERROR',
	UPDATE_QUESTIONNAIRE_EXAM_ERROR = 'UPDATE_QUESTIONNAIRE_EXAM_ERROR',
	DELETE_QUESTIONNAIRE_INVALID_PARAMS = 'DELETE_QUESTIONNAIRE_INVALID_PARAMS',
	FETCH_QUESTIONNAIRE_METRICS_ERROR = 'FETCH_QUESTIONNAIRE_METRICS_ERROR',
	FETCH_QUESTIONNAIRES_ERROR = 'FETCH_QUESTIONNAIRES_ERROR',
	FETCH_QUESTIONNAIRE_ERROR = 'FETCH_QUESTIONNAIRE_ERROR',
	DELETE_QUESTIONNAIRE_ERROR = 'DELETE_QUESTIONNAIRE_ERROR',
	QUESTIONNAIRE_METRICS_NOT_FOUND = 'QUESTIONNAIRE_METRICS_NOT_FOUND',
	QUESTIONNAIRE_NOT_FOUND = 'QUESTIONNAIRE_NOT_FOUND',
	INVALID_QUESTION = 'INVALID_QUESTION',
	INVALID_TITLE = 'INVALID_TITLE',
}

export enum EQuestionType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}
export enum EQuestionMethodType {
	CREATE = 'CREATE',
	DELETE = 'DELETE',
	UPDATE = 'UPDATE',
}

export enum EQuestionnaireType {
	QuestionnaireSurvey = 'QuestionnaireSurvey',
	QuestionnaireExam = 'QuestionnaireExam',
	QuestionnaireQuiz = 'QuestionnaireQuiz',
}
registerEnumType(EQuestionnaireErrorCode, { name: 'QuestionnaireErrorCode' });
registerEnumType(EQuestionMethodType, { name: 'QuestionMethodType' });
registerEnumType(EQuestionnaireType, { name: 'QuestionnaireType' });
registerEnumType(EQuestionType, { name: 'QuestionType' });

export interface IRepositoryCreateQuestionnareParams {
	questions: QuestionTypes[];
	userId: ObjectId;
	title: string;
	requireEmail?: boolean;
	requireName?: boolean;
	description?: string;
}

export interface IRepositoryCreateQuestionnaireExamParams extends IRepositoryCreateQuestionnareParams {
	randomizeQuestions?: boolean;
	passingGradePercent?: number;
	maxRetryAmount?: number;
	timeLimit?: number;
}
export interface IRepositoryUpdateQuestionnareParams {
	metrics: QuestionnaireMetricsDocument;
	questions?: QuestionTypes[];
	description?: string;
	active?: boolean;
	title?: string;
	requireEmail?: boolean | null;
	requireName?: boolean | null;
}

export interface IRepositoryUpdateQuestionnareQuizParams extends IRepositoryUpdateQuestionnareParams {
	quiz: QuestionnaireQuizDocument;
}

export interface IRepositoryUpdateQuestionnareSurveyParams extends IRepositoryUpdateQuestionnareParams {
	survey: QuestionnaireSurveyDocument;
}

export interface IRepositoryUpdateQuestionnareExamParams extends IRepositoryUpdateQuestionnareParams {
	exam: QuestionnaireExamDocument;
	randomizeQuestions?: boolean;
	passingGradePercent?: number | null;
	maxRetryAmount?: number | null;
	timeLimit?: number | null;
}

export interface IRepositoryFetchQuestionnaireParams {
	questionnaireSharedId?: string;
	questionnaireId?: string;
	latest?: boolean;
	userId?: string;
}

export interface IRepositoryFetchQuestionnairesParams {
	questionnaireSharedIds?: string[];
	questionnaireIds?: string[];
	userIds?: string[];
	latest?: boolean;
}

export interface IRepositoryDeleteQuestionnaireParams {
	questionnaireSharedId: string;
}

export interface ICreateQuestionnaireParams {
	questions: QuestionDiscriminatorInput[];
	type: EQuestionnaireType;
	user: AdminDocument;
	title: string;
	passingGradePercent?: number;
	randomizeQuestions?: boolean;
	maxRetryAmount?: number;
	requireEmail?: boolean;
	requireName?: boolean;
	description?: string;
	timeLimit?: number;
}

export interface IUpdateQuestionnaireParams {
	type: EQuestionnaireType;
	questionnaireId: string;
	user: AdminDocument;
	questionMethods?: QuestionMethodInput[];
	randomizeQuestions?: boolean;
	description?: string;
	active?: boolean;
	title?: string;
	passingGradePercent?: number | null;
	maxRetryAmount?: number | null;
	requireEmail?: boolean | null;
	requireName?: boolean | null;
	timeLimit?: number | null;
}

export interface IFetchQuestionnaireParams {
	questionnaireSharedId?: string;
	questionnaireId?: string;
	latest?: boolean;
	user: AdminDocument;
}

export interface IFetchQuestionnairesParams {
	questionnaireSharedIds?: string[];
	questionnaireIds?: string[];
	latest?: boolean;
	user: AdminDocument;
}

export interface IDeleteQuestionnaireParams {
	questionnaireSharedId: string;
}

export type QuestionInputTypes = QuestionSingleChoiceInput | QuestionMultipleChoiceInput | QuestionTrueOrFalseInput | QuestionTextInput;