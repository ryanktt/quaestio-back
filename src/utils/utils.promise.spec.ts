import { UtilsPromise } from './utils.promise';

import { Test } from '@nestjs/testing';

describe('UtilsPromise', () => {
	let utilsPromise: UtilsPromise;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [UtilsPromise, UtilsPromise],
		}).compile();

		utilsPromise = moduleRef.get<UtilsPromise>(UtilsPromise);
	});

	describe('Promisifies a function', () => {
		const syncFunc = (): string => 'Test';

		it('should turn a function into a promise', async () => {
			await expect(utilsPromise.promisify(syncFunc)).resolves.toBe('Test');
		});
	});
});
