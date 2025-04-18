import { EAnswerType } from '../response.interface';

import { DocumentType, SchemaBase } from '@utils/utils.schema';
import { Respondent } from '@modules/user/respondent/respondent.schema';
import { Field, Int, InterfaceType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema, SchemaTypes } from 'mongoose';
import { ObjectId } from 'mongodb';

@InterfaceType({
	isAbstract: true,
	resolveType: (value: { type: EAnswerType }): string | undefined => {
		if (value.type === EAnswerType.MULTIPLE_CHOICE) return 'AnswerMultipleChoice';
		if (value.type === EAnswerType.SINGLE_CHOICE) return 'AnswerSingleChoice';
		if (value.type === EAnswerType.TRUE_OR_FALSE) return 'AnswerTrueOrFalse';
		if (value.type === EAnswerType.RATING) return 'AnswerRating';
		if (value.type === EAnswerType.TEXT) return 'AnswerText';
		return undefined;
	},
})
@Schema({
	discriminatorKey: 'type',
})
export class Answer {
	@Field(() => EAnswerType)
	@Prop({ type: String, required: true, enum: EAnswerType })
	type: EAnswerType;

	@Field(() => String)
	@Prop({ required: true })
	question: string;

	@Field(() => Date, { nullable: true })
	@Prop()
	answeredAt?: Date;

	@Field({ nullable: true })
	@Prop()
	correct?: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

@ObjectType({ implements: Answer })
@Schema()
class AnswerSingleChoice implements Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.SINGLE_CHOICE;

	@Field(() => String)
	question: string;

	@Field(() => Date, { nullable: true })
	answeredAt: Date;

	@Field({ nullable: true })
	correct?: boolean;

	@Field({ nullable: true })
	@Prop()
	option?: string;
}

export const AnswerSingleChoiceSchema = SchemaFactory.createForClass(AnswerSingleChoice);

@ObjectType({ implements: Answer })
@Schema()
class AnswerMultipleChoice implements Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.MULTIPLE_CHOICE;

	@Field(() => String)
	question: string;

	@Field(() => Date, { nullable: true })
	answeredAt: Date;

	@Field({ nullable: true })
	correct?: boolean;

	@Field(() => [String], { nullable: true })
	@Prop({ type: () => String })
	options?: string[];
}

export const AnswerMultipleChoiceSchema = SchemaFactory.createForClass(AnswerMultipleChoice);

@ObjectType({ implements: Answer })
@Schema()
class AnswerTrueOrFalse implements Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.TRUE_OR_FALSE;

	@Field(() => String)
	question: string;

	@Field(() => Date, { nullable: true })
	answeredAt: Date;

	@Field({ nullable: true })
	correct?: boolean;

	@Field({ nullable: true })
	@Prop()
	option?: string;
}

export const AnswerTrueOrFalseSchema = SchemaFactory.createForClass(AnswerTrueOrFalse);

@ObjectType({ implements: Answer })
@Schema()
class AnswerText implements Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.TEXT;

	@Field(() => String)
	question: string;

	@Field(() => Date, { nullable: true })
	answeredAt?: Date;

	@Field({ nullable: true })
	correct?: boolean;

	@Field({ nullable: true })
	@Prop()
	text?: string;
}

export const AnswerTextSchema = SchemaFactory.createForClass(AnswerText);

@ObjectType({ implements: Answer })
@Schema()
class AnswerRating implements Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.RATING;

	@Field(() => String)
	question: string;

	@Field(() => Date, { nullable: true })
	answeredAt?: Date;

	@Field({ nullable: true })
	correct?: boolean;

	@Field(() => Number, { nullable: true })
	@Prop({ type: () => Number, max: 5, min: 0 })
	rating?: number;
}

export const AnswerRatingSchema = SchemaFactory.createForClass(AnswerRating);

export type AnswerTypes = AnswerSingleChoice | AnswerMultipleChoice | AnswerTrueOrFalse | AnswerText | AnswerRating;

@ObjectType()
@Schema()
export class Response extends SchemaBase {
	@Prop({ ref: 'Questionnaire', type: SchemaTypes.ObjectId, required: true })
	questionnaire: ObjectId;

	@Field(() => String)
	@Prop({ required: true })
	questionnaireSharedId?: string;

	@Field(() => [Answer])
	@Prop({ type: [AnswerSchema], required: true })
	answers: AnswerTypes[];

	@Field(() => Date)
	@Prop({ required: true })
	startedAt?: Date;

	@Field(() => String)
	@Prop({ required: true })
	user: ObjectId;

	@Field(() => Date, { nullable: true })
	@Prop({ required: true })
	completedAt?: Date;

	@Field(() => Int)
	@Prop({ required: true })
	answerTime: number;

	@Field(() => Respondent)
	@Prop({ ref: 'Respondent', type: SchemaTypes.ObjectId, required: true })
	respondent: string;

	@Field(() => String, { nullable: true })
	@Prop()
	respondentName?: string;

	@Field(() => String, { nullable: true })
	@Prop()
	respondentEmail?: string;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);
export type ResponseDocument = DocumentType<Response>;
export type ResponseModel = Model<Response>;

const answers = ResponseSchema.path('answers') as unknown as MongooseSchema.Types.DocumentArray;
answers.discriminator(EAnswerType.MULTIPLE_CHOICE, AnswerMultipleChoiceSchema);
answers.discriminator(EAnswerType.SINGLE_CHOICE, AnswerSingleChoiceSchema);
answers.discriminator(EAnswerType.TRUE_OR_FALSE, AnswerTrueOrFalseSchema);
answers.discriminator(EAnswerType.RATING, AnswerRatingSchema);
answers.discriminator(EAnswerType.TEXT, AnswerTextSchema);
