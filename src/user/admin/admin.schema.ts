import { EUserType } from '../user.interface';
import { User } from '../user.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { DocumentType } from '@utils/*';
import { Model } from 'mongoose';

@ObjectType()
@Schema()
export class Admin extends User {
	@Field(() => EUserType)
	type: EUserType.ADMIN;

	@Prop({ required: true })
	password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
export type AdminDocument = DocumentType<Admin>;
export type AdminModel = Model<Admin>;
