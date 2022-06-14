import { EQuestionType, EQuizType } from './quiz.interface';

import { Field, InterfaceType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DocumentType, SchemaBaseInterface } from '@utils/*';
import { Admin } from 'src/user';
import { Model } from 'mongoose';

@ObjectType()
export class Option {
	@Field()
	@Prop({ required: true })
	title: string;

	@Field({ nullable: true })
	@Prop()
	correct: boolean;

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
	type?: EQuestionType;

	@Field()
	@Prop({ required: true })
	title?: string;

	@Field({ nullable: true })
	@Prop()
	weight?: number;

	@Field()
	@Prop({ required: true, default: false })
	required?: boolean;

	@Field({ nullable: true })
	@Prop()
	description?: string;

	@Field()
	@Prop({ required: true, default: false })
	showCorrectAnswer?: boolean;
}

@ObjectType({ implements: Question })
export class QuestionSingleChoice extends Question {
	@Field(() => EQuestionType)
	type?: EQuestionType.SINGLE_CHOICE;

	@Field(() => [Option])
	@Prop({ required: true, type: () => [Option] })
	options?: Option[];

	@Field()
	@Prop({ required: true, default: false })
	randomizeOptions?: boolean;

	@Field({ nullable: true })
	@Prop()
	wrongAnswerFeedback?: string;

	@Field({ nullable: true })
	@Prop()
	correctAnswerFeedback?: string;
}

@ObjectType({ implements: Question })
export class QuestionMultipleChoice extends Question {
	@Field(() => EQuestionType)
	type?: EQuestionType.MULTIPLE_CHOICE;

	@Field(() => [Option])
	@Prop({ required: true, type: () => [Option] })
	options?: Option[];

	@Field()
	@Prop({ required: true, default: false })
	randomizeOptions?: boolean;

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
	type?: EQuestionType.TRUE_OR_FALSE;

	@Field(() => [Option])
	@Prop({ required: true, type: () => [Option] })
	options?: Option[];

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
	type?: EQuestionType.TEXT;

	@Field({ nullable: true })
	@Prop()
	feedbackAfterSubmit?: string;
}

@InterfaceType()
@Schema({ discriminatorKey: 'type' })
export class Quiz extends SchemaBaseInterface {
	@Field(() => EQuizType)
	@Prop({ enum: EQuizType, required: true })
	type?: EQuizType.EXAM;

	@Field(() => Admin)
	@Prop({ type: String, ref: 'User', required: true })
	user: string;

	@Field()
	@Prop({ required: true })
	title: string;

	@Field()
	@Prop({ required: true })
	sharedId: string;

	@Field(() => [Question])
	@Prop({
		type: () => Question,
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

@ObjectType({ implements: [Quiz, SchemaBaseInterface] })
export class QuizExam extends SchemaBaseInterface implements Quiz {
	@Field(() => EQuizType)
	type?: EQuizType.EXAM;

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

	@Field()
	@Prop({ required: true, default: false })
	randomizeQuestions?: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
export type QuizDocument = DocumentType<Quiz>;
export type QuizModel = Model<Quiz>;
