import { Injectable } from '@nestjs/common';

type ObjKeyValueMatchTypes<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

type ObjKeyTypes<T> = ObjKeyValueMatchTypes<T, string | number | symbol>;

@Injectable()
export class UtilsArray {
	getObjectsSortedByIds<T, K extends ObjKeyTypes<T>>(objects: T[], idKey: K, ids: string[]): T[] {
		const map = this.mapFromArray(objects, idKey);
		return ids.map((id) => map[id]);
	}

	mapFromArray<T, K extends ObjKeyTypes<T>>(objects: T[], key: K): Record<string, T> {
		return Object.fromEntries(objects.map((obj) => [obj[key] as unknown as string, obj]));
	}
}
