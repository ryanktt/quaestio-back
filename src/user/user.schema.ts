import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema()
export class User {
	@Field()
	@Prop({ required: true })
	name: string;

	@Field()
	@Prop({ required: true })
	email: string;

	@Field({ nullable: true })
	@Prop()
	phoneNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
