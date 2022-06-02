import { Field, ObjectType } from '@nestjs/graphql';
import mongoose, { Types, HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

mongoose.plugin((schema: mongoose.Schema) => {
	schema.set('timestamps', true);
});

export type Ref<T> = T | string | Types.ObjectId;

@ObjectType({ isAbstract: true })
export class SchemaBase {
	@Field(() => Types.ObjectId)
	readonly _id: ObjectId;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

export type DocumentType<T> = { id: string } & Omit<HydratedDocument<T>, 'id'>;
