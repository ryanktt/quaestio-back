import { EUserRole } from '../user.interface';
import { User } from '../user.schema';

import { DocumentType, SchemaBase, SchemaBaseInterface } from '@utils/utils.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Model } from 'mongoose';

@ObjectType()
export class RespondentLocation {
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

@ObjectType({ implements: [User, SchemaBaseInterface] })
@Schema()
export class Respondent extends SchemaBase implements User {
	@Field(() => EUserRole)
	role: EUserRole.Respondent;

	@Field()
	name: string;

	@Field()
	email: string;

	@Field(() => RespondentLocation, { nullable: true })
	@Prop({ type: RespondentLocation })
	location?: RespondentLocation;

	password: string;
}

export const RespondentSchema = SchemaFactory.createForClass(Respondent);
export type RespondentDocument = DocumentType<Respondent>;
export type RespondentModel = Model<Respondent>;
