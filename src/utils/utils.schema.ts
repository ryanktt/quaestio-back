import { Field, InterfaceType, ObjectType } from '@nestjs/graphql';
import mongoose, { HydratedDocument, FilterQuery } from 'mongoose';
import { ObjectId } from 'mongodb';

mongoose.plugin((schema: mongoose.Schema) => {
	schema.set('timestamps', true);
});

export type Ref<T> = T | string;

@ObjectType({ isAbstract: true })
export class SchemaBase {
	@Field(() => String)
	readonly _id: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@InterfaceType({ isAbstract: true })
export class SchemaBaseInterface {
	@Field(() => String)
	readonly _id: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

export type DocumentType<T> = Omit<HydratedDocument<T>, 'id'> & { id: string } & {
	constructor: { modelName: string };
};

export type FilterType<T> = FilterQuery<Omit<T, '_id'> & { _id: ObjectId }>;
