import { ObjKeyTypes } from './utils.interface';

import { Injectable } from '@nestjs/common';

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
