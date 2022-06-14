import {
	QuestionText,
	QuestionTrueOrFalse,
	QuestionSingleChoice,
	QuestionMultipleChoice,
} from './quiz.schema';
import { registerEnumType } from '@nestjs/graphql';

export enum EQuestionType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}
export enum EQuizType {
	SURVEY = 'SURVEY',
	EXAM = 'EXAM',
}

registerEnumType(EQuestionType, { name: 'QuestionType' });
registerEnumType(EQuizType, { name: 'QuizType' });

export type IQuestionTypes =
	| QuestionSingleChoice
	| QuestionMultipleChoice
	| QuestionTrueOrFalse
	| QuestionText;
