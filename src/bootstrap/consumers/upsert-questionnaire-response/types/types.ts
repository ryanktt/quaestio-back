import { ObjectId } from 'mongodb';

export interface SchemaBase {
	_id: ObjectId;
}

export enum EAnswerType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}

export interface Answer extends SchemaBase {
	type: EAnswerType;
	question: string;
	answeredAt?: Date;
	correct?: boolean;
}

interface AnswerSingleChoice extends Answer {
	type: EAnswerType.SINGLE_CHOICE;
	option?: string;
}

interface AnswerMultipleChoice extends Answer {
	type: EAnswerType.MULTIPLE_CHOICE;
	options?: string[];
}

interface AnswerTrueOrFalse extends Answer {
	type: EAnswerType.TRUE_OR_FALSE;
	option?: string;
}
interface AnswerText extends Answer {
	type: EAnswerType.TEXT;
	text?: string;
}

export type AnswerTypes = AnswerSingleChoice | AnswerMultipleChoice | AnswerTrueOrFalse | AnswerText;

export interface AnswerInput {
	type: EAnswerType;
	questionId: string;
	answeredAt: Date;
}

interface AnswerMultipleChoiceInput extends AnswerInput {
	type: EAnswerType.MULTIPLE_CHOICE;
	optionIds?: string[];
}

interface AnswerSingleChoiceInput extends AnswerInput {
	type: EAnswerType.SINGLE_CHOICE;
	optionId?: string;
}

interface AnswerTrueOrFalseInput extends AnswerInput {
	type: EAnswerType.MULTIPLE_CHOICE;
	optionId?: string;
}

interface AnswerTextInput extends AnswerInput {
	type: EAnswerType.TEXT;
	text?: string;
}

export type AnswerInputTypes =
	| AnswerMultipleChoiceInput
	| AnswerSingleChoiceInput
	| AnswerTrueOrFalseInput
	| AnswerTextInput;

export interface AnswerDiscriminatorInput {
	type: EAnswerType;
	answerMultipleChoice?: AnswerMultipleChoiceInput;
	answerSingleChoice?: AnswerSingleChoiceInput;
	answerTrueOrFalse?: AnswerTrueOrFalseInput;
	answerText?: AnswerTextInput;
}

export enum EQuestionType {
	MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
	SINGLE_CHOICE = 'SINGLE_CHOICE',
	TRUE_OR_FALSE = 'TRUE_OR_FALSE',
	TEXT = 'TEXT',
}

export interface Option extends SchemaBase {
	title: string;
	correct?: boolean;
	feedbackAfterSubmit?: string;
	selectedCount: number;
}

export interface Question extends SchemaBase {
	type: EQuestionType;
	title: string;
	weight?: number;
	required: boolean;
	description?: string;
	showCorrectAnswer: boolean;
	answerCount: number;
	unansweredCount: number;
}

export interface QuestionSingleChoice extends Question {
	type: EQuestionType.SINGLE_CHOICE;
	rightAnswerCount: number;
	wrongAnswerCount: number;
	options: Option[];
	randomizeOptions: boolean;
	wrongAnswerFeedback?: string;
	rightAnswerFeedback?: string;
}
export interface QuestionMultipleChoice extends Question {
	type: EQuestionType.MULTIPLE_CHOICE;
	rightAnswerCount: number;
	wrongAnswerCount: number;
	options: Option[];
	randomizeOptions: boolean;
	wrongAnswerFeedback?: string;
	rightAnswerFeedback?: string;
}

export interface QuestionTrueOrFalse extends Question {
	type: EQuestionType.TRUE_OR_FALSE;
	rightAnswerCount: number;
	wrongAnswerCount: number;
	options: Option[];
	wrongAnswerFeedback?: string;
	rightAnswerFeedback?: string;
}

export interface QuestionText extends Question {
	type: EQuestionType.TEXT;
	feedbackAfterSubmit?: string;
}

export type QuestionTypes =
	| QuestionMultipleChoice
	| QuestionSingleChoice
	| QuestionTrueOrFalse
	| QuestionText;

export enum EQuestionnaireType {
	QuestionnaireSurvey = 'QuestionnaireSurvey',
	QuestionnaireExam = 'QuestionnaireExam',
	QuestionnaireQuiz = 'QuestionnaireQuiz',
}

export interface Questionnaire extends SchemaBase {
	type: EQuestionnaireType;
	user: string;
	title: string;
	latest: boolean;
	sharedId: string;
	questions: QuestionTypes[];
	responseCount: number;
}

export interface QuestionnaireExam extends Questionnaire {
	type: EQuestionnaireType.QuestionnaireExam;
	timeLimit?: number;
	passingGradePercent?: number;
	maxRetryAmount?: number;
	randomizeQuestions: boolean;
}

export interface QuestionnaireSurvey extends Questionnaire {
	type: EQuestionnaireType.QuestionnaireSurvey;
}

export interface QuestionnaireQuiz extends Questionnaire {
	type: EQuestionnaireType.QuestionnaireQuiz;
}

export type QuestionnaireTypes = QuestionnaireExam | QuestionnaireSurvey | QuestionnaireQuiz;

export interface Response extends SchemaBase {
	questionnaire: string;
	answers: AnswerTypes[];
	startedAt?: Date;
	completedAt?: Date;
	guestRespondentId?: string;
}

export interface IUpsertResponsePayload {
	guestRespondentId: string;
	questionnaireId: string;
	answers: AnswerTypes[];
	startedAt?: Date;
}
