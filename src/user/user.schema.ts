import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, InterfaceType } from '@nestjs/graphql';
import { SchemaBase, DocumentType } from '@utils/*';
import { Model } from 'mongoose';

@InterfaceType({
	isAbstract: true,
})
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
