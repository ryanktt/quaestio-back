import {
	QuestionnaireExamDocument,
	QuestionnaireQuizDocument,
	QuestionnaireSurveyDocument,
} from '@modules/questionnaire/schema';
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
	question: ObjectId | string;
	answeredAt?: Date;
	correct?: boolean;
}

interface AnswerSingleChoice extends Answer {
	type: EAnswerType.SINGLE_CHOICE;
	option?: ObjectId | string;
}

interface AnswerMultipleChoice extends Answer {
	type: EAnswerType.MULTIPLE_CHOICE;
	options?: ObjectId[] | string[];
}

interface AnswerTrueOrFalse extends Answer {
	type: EAnswerType.TRUE_OR_FALSE;
	option?: ObjectId | string;
}
interface AnswerText extends Answer {
	type: EAnswerType.TEXT;
	text?: string;
}

export type AnswerTypes = AnswerSingleChoice | AnswerMultipleChoice | AnswerTrueOrFalse | AnswerText;

export interface AnswerInput {
	type: EAnswerType;
	questionId: ObjectId;
	answeredAt: Date;
}

interface AnswerMultipleChoiceInput extends AnswerInput {
	type: EAnswerType.MULTIPLE_CHOICE;
	optionIds?: ObjectId[];
}

interface AnswerSingleChoiceInput extends AnswerInput {
	type: EAnswerType.SINGLE_CHOICE;
	optionId?: ObjectId;
}

interface AnswerTrueOrFalseInput extends AnswerInput {
	type: EAnswerType.TRUE_OR_FALSE;
	optionId?: ObjectId;
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

export interface OptionMetrics extends SchemaBase {
	selectedCount: number;
}

export interface QuestionMetrics extends SchemaBase {
	type: EQuestionType;
	answerCount: number;
	unansweredCount: number;
}

export interface QuestionSingleChoiceMetrics extends QuestionMetrics {
	type: EQuestionType.SINGLE_CHOICE;
	options: OptionMetrics[];
	rightAnswerCount: number;
	wrongAnswerCount: number;
}

export interface QuestionMultipleChoiceMetrics extends QuestionMetrics {
	type: EQuestionType.MULTIPLE_CHOICE;
	options: OptionMetrics[];
	rightAnswerCount: number;
	wrongAnswerCount: number;
}

export interface QuestionTrueOrFalseMetrics extends QuestionMetrics {
	type: EQuestionType.TRUE_OR_FALSE;
	options: OptionMetrics[];
	rightAnswerCount: number;
	wrongAnswerCount: number;
}

export interface QuestionTextMetrics extends QuestionMetrics {
	type: EQuestionType.TEXT;
}

export type QuestionMetricsTypes =
	| QuestionMultipleChoiceMetrics
	| QuestionSingleChoiceMetrics
	| QuestionTrueOrFalseMetrics
	| QuestionTextMetrics;

export interface Option extends SchemaBase {
	title: string;
	correct?: boolean;
	feedbackAfterSubmit?: string;
}

export interface Question extends SchemaBase {
	type: EQuestionType;
	title?: string;
	weight?: number;
	required: boolean;
	description?: string;
	showCorrectAnswer: boolean;
}

export interface QuestionSingleChoice extends Question {
	type: EQuestionType.SINGLE_CHOICE;
	options: Option[];
	randomizeOptions: boolean;
	wrongAnswerFeedback?: string;
	rightAnswerFeedback?: string;
}
export interface QuestionMultipleChoice extends Question {
	type: EQuestionType.MULTIPLE_CHOICE;
	options: Option[];
	randomizeOptions: boolean;
	wrongAnswerFeedback?: string;
	rightAnswerFeedback?: string;
}

export interface QuestionTrueOrFalse extends Question {
	type: EQuestionType.TRUE_OR_FALSE;
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
	Survey = 'Survey',
	Exam = 'Exam',
	Quiz = 'Quiz',
}

export interface Questionnaire extends SchemaBase {
	type: EQuestionnaireType;
	user: string;
	title: string;
	latest: boolean;
	metrics: ObjectId;
	sharedId: string;
	questions: QuestionTypes[];
}

export interface QuestionnaireExam extends Questionnaire {
	type: EQuestionnaireType.Exam;
	timeLimit?: number;
	passingGradePercent?: number;
	maxRetryAmount?: number;
	randomizeQuestions: boolean;
}

export interface QuestionnaireSurvey extends Questionnaire {
	type: EQuestionnaireType.Survey;
}

export interface QuestionnaireQuiz extends Questionnaire {
	type: EQuestionnaireType.Quiz;
}

export type QuestionnaireTypes = QuestionnaireExam | QuestionnaireSurvey | QuestionnaireQuiz;

export type QuestionnaireDocTypes =
	| QuestionnaireExamDocument
	| QuestionnaireSurveyDocument
	| QuestionnaireQuizDocument;

export type IByLocationMetrics = {
	totalResponseCount: number;
	totalAttemptCount: number;
	totalAnswerTime: number;
	avgAnswerTime: number;
	avgAttemptCount: number;
	questionMetrics: QuestionMetricsTypes[];
};
export type IMetricsByLocationMap = Record<string, IByLocationMetrics>;

export interface QuestionnaireMetrics extends SchemaBase {
	totalResponseCount: number;
	totalAttemptCount: number;
	totalAnswerTime: number;
	avgAnswerTime: number;
	avgAttemptCount: number;
	questionMetrics: QuestionMetricsTypes[];
	/** IMetricsByLocationMap */
	byLocationMap?: string;
}

export interface Response extends SchemaBase {
	questionnaire: string;
	answers: AnswerTypes[];
	answerTime: number;
	respondent: string;
	completedAt: Date;
	startedAt: Date;
}

export interface IUpsertResponsePayload {
	questionnaireId: string;
	answers: AnswerTypes[];
	userAgent: string;
	ip: string;
	completedAt: Date;
	startedAt: Date;
	respondentToken?: string;
	email?: string;
	name?: string;
}

export interface IRespondentTokenPayload {
	respondentId?: string;
}

export interface RespondentLocation {
	country: string;
	region: string;
	city: string;
	timezone: string;
}

export enum EUserRole {
	Respondent = 'Respondent',
	Admin = 'Admin',
	User = 'User',
}

export interface User extends SchemaBase {
	role: EUserRole;
}

export interface Respondent extends User {
	email?: string;
	name?: string;
	location?: RespondentLocation;
}
