import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsPromise {
	promisify<T>(cb: () => T): Promise<T> {
		return new Promise((resolve): void => {
			const res = cb();
			return resolve(res);
		});
	}
}
