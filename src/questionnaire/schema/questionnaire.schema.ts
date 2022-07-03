import { EQuestionType, EQuestionnaireType } from '../questionnaire.interface';

import { DocumentType, SchemaBase, SchemaBaseInterface } from '@utils/*';
import { Field, Int, InterfaceType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from 'src/user';

@ObjectType()
@Schema()
export class Option extends SchemaBase {
	@Field()
	@Prop({ required: true })
	title: string;

	@Field({ nullable: true })
	@Prop()
	correct?: boolean;

	@Field({ nullable: true, defaultValue: false })
	@Prop({ default: false })
	feedbackAfterSubmit?: string;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@ObjectType()
export class OptionMetrics {
	@Field()
	optionId: string;

	@Field(() => Int)
	selectedCount: number;
}

@ObjectType()
export class QuestionMetrics {
	@Field()
	questionId: string;

	@Field(() => Int)
	answerCount: number;

	@Field(() => Int)
	rightAnswerCount: number;

	@Field(() => Int)
	wrongAnswerCount: number;

	@Field(() => Int)
	unansweredCount: number;

	@Field(() => [OptionMetrics])
	optionsMetrics: [OptionMetrics];
}

@ObjectType()
export class QuestionnaireMetrics {
	@Field(() => [QuestionMetrics])
	questionsMetrics: [QuestionMetrics];

	@Field(() => Int)
	responseCount: number;
}

@InterfaceType({
	isAbstract: true,
	resolveType: (value: { type: EQuestionType }): string | undefined => {
		if (value.type === EQuestionType.MULTIPLE_CHOICE) return 'QuestionMultipleChoice';
		if (value.type === EQuestionType.TRUE_OR_FALSE) return 'QuestionTrueOrFalse';
		if (value.type === EQuestionType.SINGLE_CHOICE) return 'QuestionSingleChoice';
		if (value.type === EQuestionType.TEXT) return 'QuestionText';
		return undefined;
	},
})
@Schema({ discriminatorKey: 'type', timestamps: true })
export class Question extends SchemaBaseInterface {
	@Field(() => EQuestionType)
	@Prop({ required: true, enum: EQuestionType })
	type: EQuestionType;

	@Field()
	@Prop({ required: true })
	title: string;

	@Field(() => Int, { nullable: true })
	@Prop()
	weight?: number;

	@Field({ defaultValue: false })
	@Prop({ required: true, default: false })
	required: boolean;

	@Field({ nullable: true })
	@Prop()
	description?: string;

	@Field({ defaultValue: false })
	@Prop({ required: true, default: false })
	showCorrectAnswer: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

@ObjectType({ implements: Question })
@Schema()
export class QuestionSingleChoice extends SchemaBase implements Question {
	@Field(() => EQuestionType)
	type: EQuestionType.SINGLE_CHOICE;

	@Field()
	title: string;

	@Field(() => Int, { nullable: true })
	weight?: number;

	@Field({ defaultValue: false })
	required: boolean;

	@Field({ nullable: true })
	description?: string;

	@Field({ defaultValue: false })
	showCorrectAnswer: boolean;

	@Field(() => [Option])
	@Prop({ required: true, type: [OptionSchema] })
	options: Option[];

	@Field()
	@Prop({ required: true, default: false })
	randomizeOptions: boolean;

	@Field({ nullable: true })
	@Prop()
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	@Prop()
	rightAnswerFeedback?: string;
}

export const QuestionSingleChoiceSchema = SchemaFactory.createForClass(QuestionSingleChoice);

@ObjectType({ implements: Question })
@Schema()
export class QuestionMultipleChoice extends SchemaBase implements Question {
	@Field(() => EQuestionType)
	type: EQuestionType.MULTIPLE_CHOICE;

	@Field()
	title: string;

	@Field(() => Int, { nullable: true })
	weight?: number;

	@Field({ defaultValue: false })
	required: boolean;

	@Field({ nullable: true })
	description?: string;

	@Field({ defaultValue: false })
	showCorrectAnswer: boolean;

	@Field(() => [Option])
	@Prop({ required: true, type: [OptionSchema] })
	options: Option[];

	@Field({ defaultValue: false })
	@Prop({ required: true, default: false })
	randomizeOptions: boolean;

	@Field({ nullable: true })
	@Prop()
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	@Prop()
	rightAnswerFeedback?: string;
}

export const QuestionMultipleChoiceSchema = SchemaFactory.createForClass(QuestionMultipleChoice);

@ObjectType({ implements: Question })
@Schema()
export class QuestionTrueOrFalse extends SchemaBase implements Question {
	@Field(() => EQuestionType)
	type: EQuestionType.TRUE_OR_FALSE;

	@Field()
	title: string;

	@Field(() => Int, { nullable: true })
	weight?: number;

	@Field({ defaultValue: false })
	required: boolean;

	@Field({ nullable: true })
	description?: string;

	@Field({ defaultValue: false })
	showCorrectAnswer: boolean;

	@Field(() => [Option])
	@Prop({ required: true, type: [OptionSchema] })
	options: Option[];

	@Field({ nullable: true })
	@Prop()
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	@Prop()
	rightAnswerFeedback?: string;
}

export const QuestionTrueOrFalseSchema = SchemaFactory.createForClass(QuestionTrueOrFalse);

@ObjectType({ implements: Question })
@Schema()
export class QuestionText extends SchemaBase implements Question {
	@Field(() => EQuestionType)
	type: EQuestionType.TEXT;

	@Field()
	title: string;

	@Field(() => Int, { nullable: true })
	weight?: number;

	@Field({ defaultValue: false })
	required: boolean;

	@Field({ nullable: true })
	description?: string;

	@Field({ defaultValue: false })
	showCorrectAnswer: boolean;

	@Field({ nullable: true })
	@Prop({ default: 'teste feedback' })
	feedbackAfterSubmit?: string;
}

export const QuestionTextSchema = SchemaFactory.createForClass(QuestionText);

export type QuestionTypes =
	| QuestionMultipleChoice
	| QuestionSingleChoice
	| QuestionTrueOrFalse
	| QuestionText;

@InterfaceType({
	isAbstract: true,
	resolveType: (questionnaire: Questionnaire): EQuestionnaireType => {
		return questionnaire.type;
	},
})
@Schema({ discriminatorKey: 'type' })
export class Questionnaire extends SchemaBaseInterface {
	@Field(() => EQuestionnaireType)
	@Prop({ enum: EQuestionnaireType, required: true })
	readonly type: EQuestionnaireType;

	@Field(() => Admin)
	@Prop({ type: String, ref: 'User', required: true })
	user: string;

	@Field()
	@Prop({ required: true })
	title: string;

	@Field()
	@Prop({ required: true, default: true })
	latest: boolean;

	@Field()
	@Prop({ default: uuidv4(), required: true })
	sharedId: string;

	@Field(() => [Question])
	@Prop({ type: [QuestionSchema], required: true })
	questions: Question[];

	@Field(() => QuestionnaireMetrics, { name: 'metrics' })
	_gql_metrics: QuestionnaireMetrics;
}

@ObjectType({ implements: [Questionnaire, SchemaBaseInterface] })
@Schema()
export class QuestionnaireExam extends SchemaBase implements Questionnaire {
	@Field(() => EQuestionnaireType)
	readonly type: EQuestionnaireType.QuestionnaireExam;

	@Field(() => Admin)
	user: string;

	@Field()
	title: string;

	@Field()
	sharedId: string;

	@Field()
	latest: boolean;

	@Field(() => [Question])
	questions: Question[];

	@Field({ nullable: true })
	@Prop()
	timeLimit?: number;

	@Field({ nullable: true })
	@Prop({ max: 1 })
	passingGradePercent?: number;

	@Field({ nullable: true })
	@Prop()
	maxRetryAmount?: number;

	@Field({ defaultValue: false })
	@Prop({ required: true, default: false })
	randomizeQuestions: boolean;

	@Field(() => QuestionnaireMetrics, { name: 'metrics' })
	_gql_metrics: QuestionnaireMetrics;
}

@ObjectType({ implements: [Questionnaire, SchemaBaseInterface] })
@Schema()
export class QuestionnaireSurvey extends SchemaBase implements Questionnaire {
	@Field(() => EQuestionnaireType)
	readonly type: EQuestionnaireType.QuestionnaireSurvey;

	@Field(() => Admin)
	user: string;

	@Field()
	title: string;

	@Field()
	sharedId: string;

	@Field()
	latest: boolean;

	@Field(() => [Question])
	questions: Question[];

	@Field(() => QuestionnaireMetrics, { name: 'metrics' })
	_gql_metrics: QuestionnaireMetrics;
}

@ObjectType({ implements: [Questionnaire, SchemaBaseInterface] })
@Schema()
export class QuestionnaireQuiz extends SchemaBase implements Questionnaire {
	@Field(() => EQuestionnaireType)
	readonly type: EQuestionnaireType.QuestionnaireQuiz;

	@Field(() => Admin)
	user: string;

	@Field()
	title: string;

	@Field()
	sharedId: string;

	@Field()
	latest: boolean;

	@Field(() => [Question])
	questions: Question[];

	@Field(() => QuestionnaireMetrics, { name: 'metrics' })
	_gql_metrics: QuestionnaireMetrics;
}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);
export type QuestionnaireDocument = DocumentType<Questionnaire>;
export type QuestionnaireModel = Model<Questionnaire>;

const questions = QuestionnaireSchema.path('questions') as unknown as MongooseSchema.Types.DocumentArray;
questions.discriminator(EQuestionType.MULTIPLE_CHOICE, QuestionMultipleChoiceSchema);
questions.discriminator(EQuestionType.SINGLE_CHOICE, QuestionSingleChoiceSchema);
questions.discriminator(EQuestionType.TRUE_OR_FALSE, QuestionTrueOrFalseSchema);
questions.discriminator(EQuestionType.TEXT, QuestionTextSchema);

export const QuestionnaireExamSchema = SchemaFactory.createForClass(QuestionnaireExam);
export type QuestionnaireExamDocument = DocumentType<QuestionnaireExam>;
export type QuestionnaireExamModel = Model<QuestionnaireExam>;

export const QuestionnaireSurveySchema = SchemaFactory.createForClass(QuestionnaireSurvey);
export type QuestionnaireSurveyDocument = DocumentType<QuestionnaireSurvey>;
export type QuestionnaireSurveyModel = Model<QuestionnaireSurvey>;

export const QuestionnaireQuizSchema = SchemaFactory.createForClass(QuestionnaireQuiz);
export type QuestionnaireQuizDocument = DocumentType<QuestionnaireQuiz>;
export type QuestionnaireQuizModel = Model<QuestionnaireQuiz>;
