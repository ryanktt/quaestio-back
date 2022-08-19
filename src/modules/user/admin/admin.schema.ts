import { EUserRole } from '../user.interface';
import { User } from '../user.schema';

import { DocumentType, SchemaBase, SchemaBaseInterface } from '@utils/utils.schema';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Model } from 'mongoose';

@ObjectType({ implements: [User, SchemaBaseInterface] })
@Schema()
export class Admin extends SchemaBase implements User {
	@Field(() => EUserRole)
	role: EUserRole.Admin;

	@Field()
	email: string;

	@Field()
	name: string;

	password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
export type AdminDocument = DocumentType<Admin>;
export type AdminModel = Model<Admin>;
