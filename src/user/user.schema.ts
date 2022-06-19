import { EUserRole } from './user.interface';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DocumentType, SchemaBaseInterface } from '@utils/*';
import { Field, InterfaceType } from '@nestjs/graphql';
import { Model } from 'mongoose';

@InterfaceType({
	isAbstract: true,
	resolveType: (user: User): EUserRole => user.role,
})
@Schema({ discriminatorKey: 'role' })
export class User extends SchemaBaseInterface {
	@Field(() => EUserRole)
	@Prop({ enum: EUserRole, required: true })
	role: EUserRole;

	@Field()
	@Prop({ required: true })
	name: string;

	@Field()
	@Prop({ required: true })
	email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = DocumentType<User>;
export type UserModel = Model<User>;
