import { EQuestionType, EQuestionnaireType } from './questionnaire.interface';

import { DocumentType, SchemaBase, SchemaBaseInterface } from '@utils/*';
import { Field, InterfaceType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from 'src/user';
import { Model } from 'mongoose';

@ObjectType()
export class Option {
	@Field()
	@Prop({ required: true })
	title: string;

	@Field({ nullable: true })
	@Prop()
	correct?: boolean;

	@Field({ nullable: true })
	@Prop()
	feedbackAfterSubmit?: string;
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
@Schema({ discriminatorKey: 'type' })
export class Question extends SchemaBaseInterface {
	@Field(() => EQuestionType)
	@Prop({ required: true, enum: EQuestionType })
	type: EQuestionType;

	@Field()
	@Prop({ required: true })
	title: string;

	@Field({ nullable: true })
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

@ObjectType({ implements: Question })
export class QuestionSingleChoice extends Question {
	@Field(() => EQuestionType)
	type: EQuestionType.SINGLE_CHOICE;

	@Field(() => [Option])
	@Prop({ required: true, type: () => [Option] })
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

@ObjectType({ implements: Question })
export class QuestionMultipleChoice extends Question {
	@Field(() => EQuestionType)
	type: EQuestionType.MULTIPLE_CHOICE;

	@Field(() => [Option])
	@Prop({ required: true, type: () => [Option] })
	options: Option[];

	@Field({ defaultValue: false })
	@Prop({ required: true, default: false })
	randomizeOptions: boolean;

	@Field({ nullable: true })
	@Prop()
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	@Prop()
	correctAnswerFeedback?: string;
}

@ObjectType({ implements: Question })
export class QuestionTrueOrFalse extends Question {
	@Field(() => EQuestionType)
	type: EQuestionType.TRUE_OR_FALSE;

	@Field(() => [Option])
	@Prop({ required: true, type: () => [Option] })
	options: Option[];

	@Field({ nullable: true })
	@Prop()
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	@Prop()
	correctAnswerFeedback?: string;
}

@ObjectType({ implements: Question })
export class QuestionText extends Question {
	@Field(() => EQuestionType)
	type: EQuestionType.TEXT;

	@Field({ nullable: true })
	@Prop()
	feedbackAfterSubmit?: string;
}

@InterfaceType({
	isAbstract: true,
	resolveType: (questionnaire: Questionnaire): EQuestionnaireType | undefined => {
		if (questionnaire.type === EQuestionnaireType.QuestionnaireSurvey)
			return EQuestionnaireType.QuestionnaireSurvey;
		if (questionnaire.type === EQuestionnaireType.QuestionnaireExam)
			return EQuestionnaireType.QuestionnaireExam;
		if (questionnaire.type === EQuestionnaireType.QuestionnaireQuiz)
			return EQuestionnaireType.QuestionnaireQuiz;
		return;
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
	@Prop({ default: uuidv4(), required: true })
	sharedId: string;

	@Field(() => [Question])
	@Prop({
		type: () => [Question],
		required: true,
		discriminators: () => [
			{ type: QuestionMultipleChoice, value: EQuestionType.MULTIPLE_CHOICE },
			{ type: QuestionSingleChoice, value: EQuestionType.SINGLE_CHOICE },
			{ type: QuestionTrueOrFalse, value: EQuestionType.TRUE_OR_FALSE },
			{ type: QuestionText, value: EQuestionType.TEXT },
		],
	})
	questions: Question[];
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

	@Field(() => [Question])
	questions: Question[];
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

	@Field(() => [Question])
	questions: Question[];
}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);
export type QuestionnaireDocument = DocumentType<Questionnaire>;
export type QuestionnaireModel = Model<Questionnaire>;

export const QuestionnaireExamSchema = SchemaFactory.createForClass(QuestionnaireExam);
export type QuestionnaireExamDocument = DocumentType<QuestionnaireExam>;
export type QuestionnaireExamModel = Model<QuestionnaireExam>;

export const QuestionnaireSurveySchema = SchemaFactory.createForClass(QuestionnaireSurvey);
export type QuestionnaireSurveyDocument = DocumentType<QuestionnaireSurvey>;
export type QuestionnaireSurveyModel = Model<QuestionnaireSurvey>;

export const QuestionnaireQuizSchema = SchemaFactory.createForClass(QuestionnaireQuiz);
export type QuestionnaireQuizDocument = DocumentType<QuestionnaireQuiz>;
export type QuestionnaireQuizModel = Model<QuestionnaireQuiz>;
