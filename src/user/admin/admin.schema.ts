import { EUserRole } from '../user.interface';
import { User } from '../user.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { DocumentType, SchemaBase } from '@utils/*';
import { Model } from 'mongoose';

@ObjectType({ implements: [User] })
@Schema()
export class Admin extends SchemaBase implements User {
	@Field(() => EUserRole)
	role: EUserRole.Admin;

	@Field()
	email: string;

	@Field()
	name: string;

	@Prop({ required: true })
	password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
export type AdminDocument = DocumentType<Admin>;
export type AdminModel = Model<Admin>;
