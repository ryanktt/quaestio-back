import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';

mongoose.plugin((schema: mongoose.Schema) => {
	schema.set('timestamps', true);
});

@ObjectType()
export class SchemaBase {
	@Field()
	readonly _id: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
