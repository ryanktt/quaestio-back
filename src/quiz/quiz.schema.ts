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
	feedback?: string;
}

@InterfaceType()
@Schema({ discriminatorKey: 'type' })
export class Quiz extends SchemaBaseInterface {
	@Field(() => Admin)
	@Prop({ type: String, ref: 'User', required: true })
	user: string;

	@Field()
	@Prop({ required: true })
	title: string;

	// @Field(() => [Questions])
	// @Prop({discriminators: ..., required: true })
	// questions: Question[]

	@Field()
	@Prop({ required: true })
	sharedId: string;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
export type QuizDocument = DocumentType<Quiz>;
export type QuizModel = Model<Quiz>;
