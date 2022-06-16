import {
	QuestionText,
	QuestionTrueOrFalse,
	QuestionSingleChoice,
	QuestionMultipleChoice,
} from './questionnaire.schema';

import { QuestionInput } from './questionnaire.input';
import { registerEnumType } from '@nestjs/graphql';
import { Admin } from 'src/user';

export enum EQuestionnaireErrorCode {
	CREATE_QUIZ_EXAM_ERROR = 'CREATE_QUIZ_EXAM_ERROR',
	CREATE_QUIZ_SURVEY_ERROR = 'CREATE_QUIZ_SURVEY_ERROR',
	CREATE_QUIZ_QUIZ_ERROR = 'CREATE_QUIZ_QUIZ_ERROR',
	UPDATE_QUIZ_EXAM_ERROR = 'UPDATE_QUIZ_EXAM_ERROR',
	UPDATE_QUIZ_SURVEY_ERROR = 'UPDATE_QUIZ_SURVEY_ERROR',
	FETCH_QUIZZES_ERROR = 'FETCH_QUIZZES_ERROR',
	FETCH_QUIZ_ERROR = 'FETCH_QUIZ_ERROR',
	QUIZ_NOT_FOUND = 'QUIZ_NOT_FOUND',
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

export interface ICreateQuestionnareParams {
	questions: QuestionInput[];
	title: string;
	user: Admin;
}
