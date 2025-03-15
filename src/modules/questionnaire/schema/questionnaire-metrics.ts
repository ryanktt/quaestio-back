import { DocumentType, SchemaBase, SchemaBaseInterface } from '@utils/utils.schema';
import { Field, Int, InterfaceType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EQuestionType } from '../questionnaire.interface';
import { Model, Schema as MongooseSchema } from 'mongoose';

@ObjectType()
@Schema()
export class OptionMetrics extends SchemaBase {
	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	selectedCount: number;
}

export const OptionMetricsSchema = SchemaFactory.createForClass(OptionMetrics);

@InterfaceType({
	isAbstract: true,
	resolveType: (value: { type: EQuestionType }): string | undefined => {
		if (value.type === EQuestionType.MULTIPLE_CHOICE) return 'QuestionMultipleChoiceMetrics';
		if (value.type === EQuestionType.TRUE_OR_FALSE) return 'QuestionTrueOrFalseMetrics';
		if (value.type === EQuestionType.SINGLE_CHOICE) return 'QuestionSingleChoiceMetrics';
		if (value.type === EQuestionType.TEXT) return 'QuestionTextMetrics';
		return undefined;
	},
})
@Schema({ discriminatorKey: 'type', timestamps: true })
export class QuestionMetrics extends SchemaBaseInterface {
	@Field(() => EQuestionType)
	type: EQuestionType;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	answerCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	unansweredCount: number;
}

@ObjectType({ implements: QuestionMetrics })
@Schema()
export class QuestionSingleChoiceMetrics extends QuestionMetrics {
	@Field(() => EQuestionType)
	type: EQuestionType.SINGLE_CHOICE;

	@Field(() => [OptionMetrics])
	@Prop({ required: true, type: [OptionMetricsSchema] })
	options: OptionMetrics[];

	@Field(() => Int, { defaultValue: 0 })
	answerCount: number;

	@Field(() => Int, { defaultValue: 0 })
	unansweredCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	rightAnswerCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	wrongAnswerCount: number;
}

@ObjectType({ implements: QuestionMetrics })
@Schema()
export class QuestionMultipleChoiceMetrics extends QuestionMetrics {
	@Field(() => EQuestionType)
	type: EQuestionType.MULTIPLE_CHOICE;

	@Field(() => [OptionMetrics])
	@Prop({ required: true, type: [OptionMetricsSchema] })
	options: OptionMetrics[];

	@Field(() => Int, { defaultValue: 0 })
	answerCount: number;

	@Field(() => Int, { defaultValue: 0 })
	unansweredCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	rightAnswerCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	wrongAnswerCount: number;
}

@ObjectType({ implements: QuestionMetrics })
@Schema()
export class QuestionTrueOrFalseMetrics extends QuestionMetrics {
	@Field(() => EQuestionType)
	type: EQuestionType.TRUE_OR_FALSE;

	@Field(() => [OptionMetrics])
	@Prop({ required: true, type: [OptionMetricsSchema] })
	options: OptionMetrics[];

	@Field(() => Int, { defaultValue: 0 })
	answerCount: number;

	@Field(() => Int, { defaultValue: 0 })
	unansweredCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	rightAnswerCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	wrongAnswerCount: number;
}

@ObjectType({ implements: QuestionMetrics })
@Schema()
export class QuestionTextMetrics extends QuestionMetrics {
	@Field(() => EQuestionType)
	type: EQuestionType.TEXT;

	@Field(() => Int, { defaultValue: 0 })
	answerCount: number;

	@Field(() => Int, { defaultValue: 0 })
	unansweredCount: number;
}

export const QuestionMetricsSchema = SchemaFactory.createForClass(QuestionMetrics);
export const QuestionSingleChoiceMetricsSchema = SchemaFactory.createForClass(QuestionSingleChoiceMetrics);
export const QuestionMultipleChoiceMetricsSchema = SchemaFactory.createForClass(
	QuestionMultipleChoiceMetrics,
);
export const QuestionTrueOrFalseMetricsSchema = SchemaFactory.createForClass(QuestionTrueOrFalseMetrics);
export const QuestionTextMetricsSchema = SchemaFactory.createForClass(QuestionTextMetrics);

export type QuestionMetricsTypes =
	| QuestionMultipleChoiceMetrics
	| QuestionSingleChoiceMetrics
	| QuestionTrueOrFalseMetrics
	| QuestionTextMetrics;

export type QuestionMetricsWithOptionsTypes =
	| QuestionMultipleChoiceMetrics
	| QuestionSingleChoiceMetrics
	| QuestionTrueOrFalseMetrics;

@ObjectType()
@Schema()
export class QuestionnaireMetrics extends SchemaBase {
	@Field(() => String)
	@Prop({ required: true })
	sharedId: string;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	totalResponseCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	totalAttemptCount: number;

	@Field(() => Int, { defaultValue: 0 })
	@Prop({ default: 0 })
	totalAnswerTime: number;

	@Field(() => Number, { defaultValue: 0 })
	@Prop({ default: 0 })
	avgAnswerTime: number;

	@Field(() => Number, { defaultValue: 0 })
	@Prop({ default: 0 })
	avgAttemptCount: number;

	@Field(() => [QuestionMetrics])
	@Prop({ type: [QuestionMetricsSchema], required: true })
	questionMetrics: QuestionMetricsTypes[];

	@Field(() => String, {
		description: 'A JSON string of the questionnaire metrics map (by location)',
		nullable: true,
	})
	@Prop()
	byLocationMap?: string;
}

export const QuestionnaireMetricsSchema = SchemaFactory.createForClass(QuestionnaireMetrics);
export type QuestionnaireMetricsDocument = DocumentType<QuestionnaireMetrics>;
export type QuestionnaireMetricsModel = Model<QuestionnaireMetrics>;

const questionMetrics = QuestionnaireMetricsSchema.path(
	'questionMetrics',
) as unknown as MongooseSchema.Types.DocumentArray;
questionMetrics.discriminator(EQuestionType.MULTIPLE_CHOICE, QuestionMultipleChoiceMetricsSchema);
questionMetrics.discriminator(EQuestionType.SINGLE_CHOICE, QuestionSingleChoiceMetricsSchema);
questionMetrics.discriminator(EQuestionType.TRUE_OR_FALSE, QuestionTrueOrFalseMetricsSchema);
questionMetrics.discriminator(EQuestionType.TEXT, QuestionTextMetricsSchema);
