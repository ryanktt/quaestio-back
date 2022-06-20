import { EAnswerType } from './response.interface';

import { Field, InterfaceType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DocumentType, SchemaBase } from '@utils/*';
import { v4 as uuidv4 } from 'uuid';
import { Model } from 'mongoose';
import { User } from 'src/user';

@InterfaceType({
	isAbstract: true,
	resolveType: (value: { type: EAnswerType }): string | undefined => {
		if (value.type === EAnswerType.MULTIPLE_CHOICE) return 'AnswerMultipleChoice';
		if (value.type === EAnswerType.SINGLE_CHOICE) return 'AnswerSingleChoice';
		if (value.type === EAnswerType.TRUE_OR_FALSE) return 'AnswerTrueOrFalse';
		if (value.type === EAnswerType.TEXT) return 'AnswerText';
		return undefined;
	},
})
@Schema({
	discriminatorKey: 'type',
})
class Answer {
	@Field(() => EAnswerType)
	@Prop({ required: true, enum: EAnswerType })
	type: EAnswerType;

	@Field(() => String, { nullable: true })
	@Prop({ enum: EAnswerType, required: true })
	question: string;

	@Field()
	@Prop({ required: true })
	answeredAt: Date;

	@Field({ nullable: true })
	@Prop()
	correct?: boolean;
}

@ObjectType({ implements: Answer })
class AnswerSingleChoice extends Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.SINGLE_CHOICE;

	@Field({ nullable: true })
	@Prop()
	option?: string;
}

@ObjectType({ implements: Answer })
class AnswerMultipleChoice extends Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.MULTIPLE_CHOICE;

	@Field(() => [String], { nullable: true })
	@Prop({ type: () => String })
	options?: string[];
}

@ObjectType({ implements: Answer })
class AnswerTrueOrFalse extends Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.TRUE_OR_FALSE;

	@Field({ nullable: true })
	@Prop()
	option?: string;
}

@ObjectType({ implements: Answer })
class AnswerText extends Answer {
	@Field(() => EAnswerType)
	type: EAnswerType.TEXT;

	@Field({ nullable: true })
	@Prop()
	text?: string;
}

@ObjectType()
@Schema()
export class Response extends SchemaBase {
	@Field(() => User)
	@Prop({ type: String, ref: 'Questionnaire', required: true })
	questionnaire: string;

	@Field()
	@Prop({ type: String, ref: 'Respondent', required: true })
	user: string;

	@Field(() => [Answer])
	@Prop({
		type: () => [Answer],
		required: true,
		discriminators: () => [
			{ type: AnswerMultipleChoice, value: EAnswerType.MULTIPLE_CHOICE },
			{ type: AnswerSingleChoice, value: EAnswerType.SINGLE_CHOICE },
			{ type: AnswerTrueOrFalse, value: EAnswerType.TRUE_OR_FALSE },
			{ type: AnswerText, value: EAnswerType.TEXT },
		],
	})
	answers: Answer[];

	@Field()
	@Prop({ default: uuidv4(), required: true })
	sharedId: string;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);
export type ResponseDocument = DocumentType<Response>;
export type ResponseModel = Model<Response>;
