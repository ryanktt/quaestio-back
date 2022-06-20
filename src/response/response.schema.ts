import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DocumentType, SchemaBase } from '@utils/*';
import { Field, ObjectType } from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';
import { Model } from 'mongoose';
import { User } from 'src/user';

@ObjectType()
@Schema()
export class Response extends SchemaBase {
	@Field(() => User)
	@Prop({ type: String, ref: 'Questionnaire', required: true })
	questionnaire: string;

	@Field()
	@Prop({ type: String, ref: 'Respondent', required: true })
	user: string;

	// @Field()
	// @Prop({ required: true })
	// answers: Answer[];

	@Field()
	@Prop({ default: uuidv4(), required: true })
	sharedId: string;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);
export type ResponseDocument = DocumentType<Response>;
export type ResponseModel = Model<Response>;
