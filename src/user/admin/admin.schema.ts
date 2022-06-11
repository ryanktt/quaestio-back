import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectType } from '@nestjs/graphql';
import { DocumentType } from '@utils/*';
import { User } from '../user.schema';
import { Model } from 'mongoose';

@ObjectType()
@Schema()
export class Admin extends User {
	@Prop({ required: true })
	password: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
export type AdminDocument = DocumentType<Admin>;
export type AdminModel = Model<Admin>;
