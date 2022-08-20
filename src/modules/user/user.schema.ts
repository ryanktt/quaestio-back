import { EUserRole } from './user.interface';

import { DocumentType, SchemaBaseInterface } from '@utils/utils.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, InterfaceType } from '@nestjs/graphql';
import { Model } from 'mongoose';

@InterfaceType({
	isAbstract: true,
	resolveType: (user: User): EUserRole => user.role,
})
@Schema({ discriminatorKey: 'role' })
export class User extends SchemaBaseInterface {
	@Field(() => EUserRole)
	@Prop({ type: String, enum: EUserRole, required: true })
	role: EUserRole;

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
