import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DocumentType, Ref, SchemaBase } from '@utils/*';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@modules/user';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@ObjectType()
@Schema()
export class Session extends SchemaBase {
	@Field(() => User)
	@Prop({ type: ObjectId, ref: 'User', required: true })
	user: Ref<User>;

	@Field()
	@Prop({ required: true })
	ip: string;

	@Field()
	@Prop({ required: true })
	userAgent: string;

	@Field({ defaultValue: true })
	@Prop({ default: true, required: true })
	active: boolean;

	@Field()
	@Prop({ required: true })
	expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
export type SessionDocument = DocumentType<Session>;
export type SessionModel = Model<Session>;
