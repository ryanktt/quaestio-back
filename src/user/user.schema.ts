import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, InterfaceType } from '@nestjs/graphql';
import { SchemaBase, DocumentType } from '@utils/*';
import { EUserType } from './user.interface';
import { Model } from 'mongoose';
import { Admin } from './admin';

@InterfaceType({
	isAbstract: true,
	implements: [Admin],
	resolveType: (user: User) => {
		const map: Record<EUserType, string> = {
			[EUserType.ADMIN]: 'Admin',
		};
		return map[user.type];
	},
})
@Schema({ discriminatorKey: 'type' })
export class User extends SchemaBase {
	@Field(() => EUserType)
	@Prop({ required: true, enum: EUserType })
	type: EUserType;

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
