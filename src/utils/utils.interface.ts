import { ObjectId } from 'mongodb';

export type ObjKeyValueMatchTypes<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type ObjKeyTypes<T> = ObjKeyValueMatchTypes<T, string | number | symbol | ObjectId>;

export interface IAWSSendToKinesis {
	payload: Record<string, unknown>;
	streamName: string;
	key: string;
}
