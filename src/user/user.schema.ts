import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema()
export class User {
	@Field()
	@Prop()
	name: string;

	@Field()
	@Prop()
	email: string;

	@Field()
	@Prop()
	phoneNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
