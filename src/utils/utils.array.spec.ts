import { UtilsArray } from './utils.array';
import { Test } from '@nestjs/testing';

describe('UtilsArray', () => {
	let utilsArray: UtilsArray;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [UtilsArray],
		}).compile();

		utilsArray = moduleRef.get<UtilsArray>(UtilsArray);
	});

	describe('Creates a map object from an array', () => {
		const objArray = [
			{ id: '123', name: 'Liara' },
			{ id: '321', name: 'Tsuni' },
		];
		const map = {
			['123']: { id: '123', name: 'Liara' },
			['321']: { id: '321', name: 'Tsuni' },
		};
		it('should return a map object', () => {
			expect(utilsArray.mapFromArray(objArray, 'id')).toStrictEqual(map);
		});
	});

	describe('Sorts an object array by its ids', () => {
		const unorderedObjs = [
			{ id: '2', name: 'Liara' },
			{ id: '3', name: 'Gerry' },
			{ id: '1', name: 'Shepard' },
		];
		const orderedObjIds = ['1', '2', '3'];
		const orderedObjs = [
			{ id: '1', name: 'Shepard' },
			{ id: '2', name: 'Liara' },
			{ id: '3', name: 'Gerry' },
		];
		it('should return the the sorted objects', () => {
			expect(utilsArray.getObjectsSortedByIds(unorderedObjs, 'id', orderedObjIds)).toStrictEqual(orderedObjs);
		});
	});
});
