import {
	Question,
	QuestionText,
	QuestionTrueOrFalse,
	QuestionSingleChoice,
	QuestionMultipleChoice,
	QuestionnaireQuizDocument,
	QuestionnaireExamDocument,
	QuestionDiscriminatorInput,
	QuestionnaireSurveyDocument,
} from './schema';

import { registerEnumType } from '@nestjs/graphql';
import { AdminDocument } from 'src/user';

export enum EQuestionnaireErrorCode {
	CREATE_QUESTIONNAIRE_INVALID_PARAMS = 'CREATE_QUESTIONNAIRE_INVALID_PARAMS',
	UPDATE_QUESTIONNAIRE_INVALID_PARAMS = 'UPDATE_QUESTIONNAIRE_INVALID_PARAMS',
	FETCH_QUESTIONNAIRE_INVALID_PARAMS = 'FETCH_QUESTIONNAIRE_INVALID_PARAMS',
	FETCH_QUESTIONNAIRES_INVALID_PARAMS = 'FETCH_QUESTIONNAIRES_INVALID_PARAMS',
	CREATE_QUESTIONNAIRE_SURVEY_ERROR = 'CREATE_QUESTIONNAIRE_SURVEY_ERROR',
	CREATE_QUESTIONNAIRE_QUIZ_ERROR = 'CREATE_QUESTIONNAIRE_QUIZ_ERROR',
	CREATE_QUESTIONNAIRE_EXAM_ERROR = 'CREATE_QUESTIONNAIRE_EXAM_ERROR',
	UPDATE_QUESTIONNAIRE_SURVEY_ERROR = 'UPDATE_QUESTIONNAIRE_SURVEY_ERROR',
	UPDATE_QUESTIONNAIRE_QUIZ_ERROR = 'UPDATE_QUESTIONNAIRE_QUIZ_ERROR',
	UPDATE_QUESTIONNAIRE_EXAM_ERROR = 'UPDATE_QUESTIONNAIRE_EXAM_ERROR',
	FETCH_QUESTIONNAIRES_ERROR = 'FETCH_QUESTIONNAIRES_ERROR',
	FETCH_QUESTIONNAIRE_ERROR = 'FETCH_QUESTIONNAIRE_ERROR',
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
export enum EQuestionnaireType {
	QuestionnaireSurvey = 'QuestionnaireSurvey',
	QuestionnaireExam = 'QuestionnaireExam',
	QuestionnaireQuiz = 'QuestionnaireQuiz',
}
registerEnumType(EQuestionnaireErrorCode, { name: 'QuestionnaireErrorCode' });
registerEnumType(EQuestionnaireType, { name: 'QuestionnaireType' });
registerEnumType(EQuestionType, { name: 'QuestionType' });

export type IQuestionTypes =
	| QuestionSingleChoice
	| QuestionMultipleChoice
	| QuestionTrueOrFalse
	| QuestionText;

export interface IRepositoryCreateQuestionnareParams {
	questions: Question[];
	userId: string;
	title: string;
}

export interface IRepositoryCreateQuestionnaireExamParams extends IRepositoryCreateQuestionnareParams {
	randomizeQuestions?: boolean;
	passingGradePercent?: number;
	maxRetryAmount?: number;
	timeLimit?: number;
}

export interface IRepositoryUpdateQuestionnareQuizParams {
	quiz: QuestionnaireQuizDocument;
	questions?: Question[];
	title?: string;
}

export interface IRepositoryUpdateQuestionnareSurveyParams {
	survey: QuestionnaireSurveyDocument;
	questions?: Question[];
	title?: string;
}

export interface IRepositoryUpdateQuestionnareExamParams {
	exam: QuestionnaireExamDocument;
	randomizeQuestions?: boolean;
	questions?: Question[];
	title?: string;
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

export interface ICreateQuestionnaireParams {
	questions: QuestionDiscriminatorInput[];
	type: EQuestionnaireType;
	user: AdminDocument;
	title: string;
	passingGradePercent?: number;
	randomizeQuestions?: boolean;
	maxRetryAmount?: number;
	timeLimit?: number;
}

export interface IUpdateQuestionnaireParams {
	type: EQuestionnaireType;
	questionnaireId: string;
	user: AdminDocument;
	questions?: QuestionDiscriminatorInput[];
	randomizeQuestions?: boolean;
	title?: string;
	passingGradePercent?: number | null;
	maxRetryAmount?: number | null;
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
