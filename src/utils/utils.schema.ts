import mongoose, { Types, HydratedDocument } from 'mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

mongoose.plugin((schema: mongoose.Schema) => {
	schema.set('timestamps', true);
});

export type Ref<T> = T | string | Types.ObjectId;

@ObjectType({ isAbstract: true })
export class SchemaBase {
	@Field(() => String)
	readonly _id: string;
 
	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

export type DocumentType<T> = { id: string } & Omit<HydratedDocument<T>, 'id'>;
