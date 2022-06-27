import { UtilsPromise } from './utils.promise';
import { DocumentType } from './utils.schema';
import { UtilsDoc } from './utils.doc';

import { Test } from '@nestjs/testing';

type IUserDocCounterpart = DocumentType<{ id: string; name?: string }>;
type IQuestDocCounterpart = DocumentType<{ user: string }>;

describe('UtilsDoc', () => {
	let utilsDoc: UtilsDoc;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [UtilsDoc, UtilsPromise],
		}).compile();

		utilsDoc = moduleRef.get<UtilsDoc>(UtilsDoc);
	});

	describe('Asserts equality between mongo document id fields', () => {
		const questionnaireDocCounterpart = { user: '123456789' } as IQuestDocCounterpart;
		const userDocCounterpart = { id: '123456789' } as IUserDocCounterpart;
		questionnaireDocCounterpart.constructor.modelName = 'Questionnaire';

		it('should do nothing', async () => {
			await expect(
				utilsDoc.validateUserDocAccess(questionnaireDocCounterpart, [
					{ doc: userDocCounterpart, refKey: 'user' },
				]),
			).resolves.toBeUndefined();
		});

		it('should throw an error', async () => {
			questionnaireDocCounterpart.user = '987654321';
			await expect(
				utilsDoc.validateUserDocAccess(questionnaireDocCounterpart, [
					{ doc: userDocCounterpart, refKey: 'user' },
				]),
			).rejects.toThrowError('user does not have access to Questionnaire');
		});
	});

	describe('Updates a mongo document field', () => {
		const userDocCounterpart = { id: '123', name: 'Luis' } as IUserDocCounterpart;

		it('should update the name', () => {
			expect(
				utilsDoc.handleFieldUpdate({ doc: userDocCounterpart, field: 'name', value: 'Lerry' }),
			).toStrictEqual({ id: '123', name: 'Lerry' });
		});

		it('should remove the name from the doc', () => {
			expect(
				utilsDoc.handleFieldUpdate({ doc: userDocCounterpart, field: 'name', value: null }),
			).toStrictEqual({ id: '123', name: undefined });
		});

		it('should do nothing and return undefined', () => {
			userDocCounterpart.name = 'Luis';
			expect(
				utilsDoc.handleFieldUpdate({ doc: userDocCounterpart, field: 'name', value: 'Luis' }),
			).toBeUndefined();
		});
	});
});
