import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DocumentType, SchemaBase } from '@utils/*';
import { Field, ObjectType } from '@nestjs/graphql';
import { Model } from 'mongoose';

@ObjectType()
export class Location {
	@Field()
	@Prop({ required: true })
	country: string;

	@Field()
	@Prop({ required: true })
	state: string;

	@Field()
	@Prop({ required: true })
	city: string;

	@Field()
	@Prop({ required: true })
	timezone: string;
}

@ObjectType()
@Schema()
export class Respondent extends SchemaBase {
	@Field()
	@Prop({ required: true })
	name: string;

	@Field()
	@Prop({ required: true })
	email: string;

	@Field()
	@Prop({ required: true })
	ip: string;

	@Field()
	@Prop({ required: true })
	userAgent: string;

	@Field(() => Location, { nullable: true })
	@Prop({ type: Location })
	location?: Location;

	// quiz
}

export const RespondentSchema = SchemaFactory.createForClass(Respondent);
export type RespondentDocument = DocumentType<Respondent>;
export type RespondentModel = Model<Respondent>;
