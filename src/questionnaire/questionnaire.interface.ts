import {
	QuestionText,
	QuestionTrueOrFalse,
	QuestionSingleChoice,
	QuestionMultipleChoice,
} from './questionnaire.schema';

import { QuestionDiscriminatorInput, QuestionInput } from './questionnaire.input';
import { registerEnumType } from '@nestjs/graphql';
import { Admin } from 'src/user';

export enum EQuestionnaireErrorCode {
	CREATE_QUESTIONNAIRE_INVALID_PARAMS = 'CREATE_QUESTIONNAIRE_INVALID_PARAMS',
	CREATE_QUESTIONNAIRE_SURVEY_ERROR = 'CREATE_QUESTIONNAIRE_SURVEY_ERROR',
	CREATE_QUESTIONNAIRE_QUIZ_ERROR = 'CREATE_QUESTIONNAIRE_QUIZ_ERROR',
	CREATE_QUESTIONNAIRE_EXAM_ERROR = 'CREATE_QUESTIONNAIRE_EXAM_ERROR',
	UPDATE_QUESTIONNAIRE_SURVEY_ERROR = 'UPDATE_QUESTIONNAIRE_SURVEY_ERROR',
	UPDATE_QUESTIONNAIRE_EXAM_ERROR = 'UPDATE_QUESTIONNAIRE_EXAM_ERROR',
	FETCH_QUESTIONNAIRES_ERROR = 'FETCH_QUESTIONNAIRES_ERROR',
	FETCH_QUESTIONNAIRE_ERROR = 'FETCH_QUESTIONNAIRE_ERROR',
	QUESTIONNAIRE_NOT_FOUND = 'QUESTIONNAIRE_NOT_FOUND',
	QUESTION_REQUIRED = 'QUESTION_REQUIRED',
	INVALID_TITLE = 'INVALID_TITLE',
}

export enum EQuestionType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}
export enum EQuestionnaireType {
	SURVEY = 'SURVEY',
	EXAM = 'EXAM',
	QUIZ = 'QUIZ',
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
	questions: QuestionInput[];
	userId: string;
	title: string;
}

export interface ICreateQuestionnaireQuizParams {
	questions: QuestionDiscriminatorInput[];
	title: string;
	user: Admin;
}
