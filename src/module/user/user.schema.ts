import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaBase, DocumentType } from '@utils/*';
import { Field, ObjectType } from '@nestjs/graphql';
import { Model } from 'mongoose';

@ObjectType()
@Schema()
export class User extends SchemaBase {
	@Field()
	@Prop({ required: true })
	name: string;

	@Field()
	@Prop({ required: true })
	email: string;

	@Prop({ required: true })
	password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = DocumentType<User>;
export type UserModel = Model<User>;
