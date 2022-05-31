import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Ref, SchemaBase } from '@utils/utils.schema';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@modules/user';

@ObjectType()
@Schema()
export class Session extends SchemaBase {
	@Field(() => User)
	@Prop({ ref: 'User', required: true })
	user: Ref<User>;

	@Field()
	@Prop({ required: true })
	ip: string;

	@Field()
	@Prop({ required: true })
	userAgent: string;

	@Field()
	@Prop({ required: true })
	active: boolean;

	@Field()
	@Prop({ required: true })
	expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
