import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

mongoose.plugin((schema: mongoose.Schema) => {
	schema.set('timestamps', true);
});

export type Ref<T> = T | string | ObjectId;

@ObjectType({ isAbstract: true })
export class SchemaBase {
	@Field()
	readonly _id: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
