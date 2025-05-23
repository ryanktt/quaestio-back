import { EQuestionType, EQuestionnaireType } from '../questionnaire.interface';

import { DocumentType, SchemaBase, SchemaBaseInterface } from '@utils/utils.schema';
import { Field, Int, InterfaceType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionnaireMetrics } from './questionnaire-metrics';
import { Model, Schema as MongooseSchema, SchemaTypes } from 'mongoose';
import { Admin } from '@modules/user/admin/admin.schema';
import { nanoid } from 'nanoid';
import { ObjectId } from 'mongodb';

@ObjectType()
@Schema()
export class Option extends SchemaBase {
	@Field()
	@Prop({ required: true })
	title: string;

	@Prop()
	correct?: boolean;

	@Field({ nullable: true, description: 'For true or false questions.' })
	@Prop()
	true?: boolean;

	@Field({ nullable: true })
	@Prop()
	feedbackAfterSubmit?: string;
}

export const OptionSchema = SchemaFactory.createForClass(Option);

@InterfaceType({
	isAbstract: true,
	resolveType: (value: { type: EQuestionType }): string | undefined => {
		if (value.type === EQuestionType.MULTIPLE_CHOICE) return 'QuestionMultipleChoice';
		if (value.type === EQuestionType.TRUE_OR_FALSE) return 'QuestionTrueOrFalse';
		if (value.type === EQuestionType.SINGLE_CHOICE) return 'QuestionSingleChoice';
		if (value.type === EQuestionType.RATING) return 'QuestionRating';
		if (value.type === EQuestionType.TEXT) return 'QuestionText';
		return undefined;
	},
})
@Schema({ discriminatorKey: 'type', timestamps: true })
export class Question extends SchemaBaseInterface {
	@Field(() => EQuestionType)
	@Prop({ type: String, required: true, enum: EQuestionType })
	type: EQuestionType;

	@Field({ nullable: true })
	@Prop()
	title?: string;

	@Field(() => Int, { nullable: true })
	@Prop()
	weight?: number;

	@Field({ defaultValue: false })
	@Prop({ required: true, default: false })
	required: boolean;

	@Field({ nullable: true })
	@Prop()
	description?: string;

	@Field({ defaultValue: true })
	@Prop({ required: true, default: false })
	showCorrectAnswer: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

@ObjectType({ implements: Question })
@Schema()
export class QuestionSingleChoice extends SchemaBase implements Question {
	@Field(() => EQuestionType)
	type: EQuestionType.SINGLE_CHOICE;

	@Field({ nullable: true })
	title?: string;

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

	@Field({ nullable: true })
	title?: string;

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

	@Field({ nullable: true })
	title?: string;

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

	@Field({ nullable: true })
	title?: string;

	@Field(() => Int, { nullable: true })
	weight?: number;

	@Field({ defaultValue: false })
	required: boolean;

	@Field({ nullable: true })
	description?: string;

	@Field({ defaultValue: false })
	showCorrectAnswer: boolean;

	@Field({ nullable: true })
	@Prop()
	feedbackAfterSubmit?: string;
}

export const QuestionTextSchema = SchemaFactory.createForClass(QuestionText);

@ObjectType({ implements: Question })
@Schema()
export class QuestionRating extends SchemaBase implements Question {
	@Field(() => EQuestionType)
	type: EQuestionType.RATING;

	@Field({ nullable: true })
	title?: string;

	@Field(() => Int, { nullable: true })
	weight?: number;

	@Field({ defaultValue: false })
	required: boolean;

	@Field({ nullable: true })
	description?: string;

	@Field({ defaultValue: false })
	showCorrectAnswer: boolean;

	@Field({ nullable: true })
	@Prop()
	feedbackAfterSubmit?: string;
}

export const QuestionRatingSchema = SchemaFactory.createForClass(QuestionText);

export type QuestionTypes =
	| QuestionMultipleChoice
	| QuestionSingleChoice
	| QuestionTrueOrFalse
	| QuestionText
	| QuestionRating;

@InterfaceType({
	isAbstract: true,
	resolveType: (questionnaire: Questionnaire): EQuestionnaireType => {
		return questionnaire.type;
	},
})
@Schema({ discriminatorKey: 'type' })
export class Questionnaire extends SchemaBaseInterface {
	@Field(() => EQuestionnaireType)
	@Prop({ type: String, enum: EQuestionnaireType, required: true })
	readonly type: EQuestionnaireType;

	@Field(() => QuestionnaireMetrics)
	metrics: ObjectId;

	@Field({ defaultValue: true })
	@Prop({ required: true, default: true })
	active: boolean;

	@Field({ defaultValue: true })
	@Prop({ required: true, default: true })
	requireEmail: boolean;

	@Field({ defaultValue: false })
	@Prop({ required: true, default: false })
	requireName: boolean;

	@Field(() => Admin)
	@Prop({ ref: 'User', type: SchemaTypes.ObjectId, required: true })
	user: ObjectId;

	@Field()
	@Prop({ required: true })
	title: string;

	@Field()
	@Prop({ required: true })
	description: string;

	@Field()
	@Prop({ required: true, default: true })
	latest: boolean;

	@Field()
	@Prop({ default: () => nanoid(10), required: true })
	sharedId: string;

	@Field(() => [Question])
	@Prop({ type: [QuestionSchema], required: true })
	questions: QuestionTypes[];

	@Field(() => Date)
	@Prop({ default: () => new Date(), required: true })
	sharedCreatedAt: Date;

	@Field(() => String, { nullable: true })
	@Prop()
	color: string;

	@Field(() => String, { nullable: true })
	@Prop()
	bgColor: string;
}

@ObjectType({ implements: [Questionnaire, SchemaBaseInterface] })
@Schema()
export class QuestionnaireExam extends SchemaBase implements Questionnaire {
	@Field(() => EQuestionnaireType)
	readonly type: EQuestionnaireType.QuestionnaireExam;

	@Field(() => QuestionnaireMetrics)
	metrics: ObjectId;

	@Field({ defaultValue: true })
	active: boolean;

	@Field({ defaultValue: true })
	requireEmail: boolean;

	@Field({ defaultValue: false })
	requireName: boolean;

	@Field(() => Admin)
	user: ObjectId;

	@Field()
	title: string;

	@Field()
	description: string;

	@Field()
	sharedId: string;

	@Field()
	latest: boolean;

	@Field(() => [Question])
	questions: QuestionTypes[];

	@Field(() => Date)
	sharedCreatedAt: Date;

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

	@Field(() => String, { nullable: true })
	color: string;

	@Field(() => String, { nullable: true })
	bgColor: string;
}

@ObjectType({ implements: [Questionnaire, SchemaBaseInterface] })
@Schema()
export class QuestionnaireSurvey extends SchemaBase implements Questionnaire {
	@Field(() => EQuestionnaireType)
	readonly type: EQuestionnaireType.QuestionnaireSurvey;

	@Field(() => QuestionnaireMetrics)
	metrics: ObjectId;

	@Field({ defaultValue: true })
	active: boolean;

	@Field({ defaultValue: true })
	requireEmail: boolean;

	@Field({ defaultValue: false })
	requireName: boolean;

	@Field(() => Admin)
	user: ObjectId;

	@Field()
	title: string;

	@Field()
	description: string;

	@Field()
	sharedId: string;

	@Field()
	latest: boolean;

	@Field(() => [Question])
	questions: QuestionTypes[];

	@Field(() => Date)
	sharedCreatedAt: Date;

	@Field(() => String, { nullable: true })
	color: string;

	@Field(() => String, { nullable: true })
	bgColor: string;
}

@ObjectType({ implements: [Questionnaire, SchemaBaseInterface] })
@Schema()
export class QuestionnaireQuiz extends SchemaBase implements Questionnaire {
	@Field(() => EQuestionnaireType)
	readonly type: EQuestionnaireType.QuestionnaireQuiz;

	@Field(() => QuestionnaireMetrics)
	metrics: ObjectId;

	@Field({ defaultValue: true })
	active: boolean;

	@Field({ defaultValue: true })
	requireEmail: boolean;

	@Field({ defaultValue: false })
	requireName: boolean;

	@Field(() => Admin)
	user: ObjectId;

	@Field()
	title: string;

	@Field()
	description: string;

	@Field()
	sharedId: string;

	@Field()
	latest: boolean;

	@Field(() => [Question])
	questions: QuestionTypes[];

	@Field(() => Date)
	sharedCreatedAt: Date;

	@Field(() => String, { nullable: true })
	color: string;

	@Field(() => String, { nullable: true })
	bgColor: string;
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
